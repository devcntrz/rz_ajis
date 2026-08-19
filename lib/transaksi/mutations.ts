/**
 * lib/transaksi/mutations.ts — writes for the Transaksi module.
 *
 * Everything here runs inside a single DB transaction. The legacy code ran
 * DELETE → N×INSERT → N×UPDATE-JOIN → UPDATE with no transaction at all, so any failure
 * mid-loop left a transaction half-split — the money visible in `ajis_input_donasi` no
 * longer matching `transaksi.total_input_donasi`.
 *
 * Two other legacy behaviours are deliberately NOT reproduced:
 *  - `DELETE FROM ajis_input_donasi WHERE id_anak = ''` ran on every single save with no
 *    transid filter, i.e. it swept the whole 500k-row table. Replaced by rejecting an
 *    empty id_anak at the schema boundary.
 *  - Denormalised names were filled in by two UPDATE-JOINs *per inserted row*. They are
 *    now read once up front and written as part of the same batch INSERT.
 */

import {
  withTransaction,
  txQuery,
  txQueryOne,
  txExecute,
  txExecuteResult,
  txQueryUnprepared,
  type TxConnection,
} from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import { getTransaksiScope } from '@/lib/transaksi/scope';
import { TRANSAKSI_COLUMNS } from '@/lib/transaksi/queries';
import {
  RuleError,
  assertCanEntry,
  assertSalurPeriodSet,
  assertTotalMatches,
  idPemasanganBaru,
  periode,
} from '@/lib/transaksi/rules';
import type { EntriesPayload } from '@/lib/transaksi/schema';
import type { Transaksi } from '@/types/transaksi';
import { z } from 'zod';
import type { approveSalurPayload, reviewApprovePayload } from '@/lib/transaksi/schema';

type ApproveSalurInput = z.infer<typeof approveSalurPayload>;
type ReviewApproveInput = z.infer<typeof reviewApprovePayload>;

/**
 * Locks the transaction row for the duration of the write.
 *
 * Without the lock, two operators entering the same transaction concurrently would both
 * pass the total-matches check and both insert their own full set of splits, doubling
 * the money against a single donation.
 */
async function lockTransaksi(
  conn: TxConnection,
  transid: string,
  detailid: number,
  session: SessionData,
): Promise<Transaksi> {
  const scope = getTransaksiScope(session, 'a');
  const row = await txQueryOne<Transaksi>(
    conn,
    `SELECT ${TRANSAKSI_COLUMNS}
     FROM transaksi a
     WHERE a.transid = ? AND a.detailid = ? AND ${scope.sql}
     LIMIT 1
     FOR UPDATE`,
    [transid, detailid, ...scope.params],
  );
  if (!row) {
    throw new RuleError('Transaksi tidak ditemukan atau di luar akses Anda.');
  }
  return row;
}

/**
 * Recomputes the cached rollup on `transaksi` from what is actually stored.
 *
 * Always derived from a fresh SUM rather than from the payload, so the cached columns
 * cannot drift away from the rows even if a caller miscounts.
 */
async function recalcTransaksi(
  conn: TxConnection,
  transid: string,
  detailid: number,
  opts: { username: string; mode: 'create' | 'update' },
): Promise<{ total: number; selisih: number }> {
  const sumRow = await txQueryOne<{ total: number | null }>(
    conn,
    `SELECT COALESCE(SUM(nominal_donasi), 0) AS total
     FROM ajis_input_donasi
     WHERE transid = ? AND detailid = ?`,
    [transid, detailid],
  );
  const total = Math.round(Number(sumRow?.total ?? 0));

  // `user_insert_cf` records who first split the money, `user_update_cf` who last
  // changed it — matching the two legacy save paths.
  const userCol = opts.mode === 'create' ? 'user_insert_cf' : 'user_update_cf';

  await txExecute(
    conn,
    `UPDATE transaksi
     SET status_pasang      = ?,
         ${userCol}         = ?,
         total_input_donasi = ?,
         selisih_donasi     = perkiraan_rp - ?
     WHERE transid = ? AND detailid = ?`,
    [total > 0 ? 'y' : 'n', opts.username, total, total, transid, detailid],
  );

  const after = await txQueryOne<{ selisih_donasi: number }>(
    conn,
    `SELECT selisih_donasi FROM transaksi WHERE transid = ? AND detailid = ? LIMIT 1`,
    [transid, detailid],
  );

  return { total, selisih: Number(after?.selisih_donasi ?? 0) };
}

interface AnakSnapshot {
  nama_lengkap:       string;
  nik:                string;
  nama_wilayah:       string;
  nama_kantor:        string;
  jenjang_pendidikan: string;
  jns_kel:            string;
  asnaf:              string;
}

/**
 * One lookup for every child in the payload, replacing legacy's per-row UPDATE-JOIN.
 * Placeholders are generated from the array length, values still bound.
 */
async function loadAnakSnapshots(
  conn: TxConnection,
  idAnakList: string[],
): Promise<Map<string, AnakSnapshot>> {
  if (idAnakList.length === 0) return new Map();

  const placeholders = idAnakList.map(() => '?').join(',');
  const rows = await txQuery<AnakSnapshot & { id_anak: string }>(
    conn,
    `SELECT id_anak, nama_lengkap, nik, nama_wilayah, nama_kantor,
            jenjang_pendidikan, jns_kel, asnaf
     FROM ajis_anak
     WHERE id_anak IN (${placeholders})`,
    idAnakList,
  );

  return new Map(rows.map(r => [r.id_anak, r]));
}

export interface SaveEntriesResult {
  transid:            string;
  detailid:           number;
  rows_inserted:      number;
  total_input_donasi: number;
  selisih_donasi:     number;
  periode:            string;
}

/**
 * Entry / Update Cashflow — the module's critical path.
 *
 * Replaces the four legacy endpoints (c_kantor_ganjil, c_kantor_genap, u_kantor_ganjil,
 * u_kantor_genap) plus the admin variants with one idempotent operation: the semester is
 * derived from the transaction's own `bulan_salur`, and the write is always
 * delete-then-reinsert, so replaying the same payload yields the same rows.
 */
export async function saveEntries(
  transid: string,
  detailid: number,
  payload: EntriesPayload,
  session: SessionData,
): Promise<SaveEntriesResult> {
  return withTransaction(async conn => {
    const trx = await lockTransaksi(conn, transid, detailid, session);

    if (payload.mode === 'create') {
      assertCanEntry(trx);
    }

    const bulan = assertSalurPeriodSet(trx);
    const tahun = String(trx.tahun_salur).trim();
    const per = periode(bulan);

    assertTotalMatches(payload.rows, Number(trx.perkiraan_rp));

    const idAnakList = [...new Set(payload.rows.map(r => r.id_anak))];
    if (idAnakList.length !== payload.rows.length) {
      throw new RuleError('Terdapat anak yang sama lebih dari satu kali dalam entry.');
    }

    const snapshots = await loadAnakSnapshots(conn, idAnakList);
    const missing = idAnakList.filter(id => !snapshots.has(id));
    if (missing.length > 0) {
      throw new RuleError(`Anak tidak ditemukan di master: ${missing.slice(0, 5).join(', ')}.`);
    }

    // Donor name is taken from the master, never from the client payload.
    const donatur = await txQueryOne<{ nama_lengkap: string }>(
      conn,
      'SELECT nama_lengkap FROM donatur WHERE did = ? LIMIT 1',
      [trx.did],
    );
    const namaDonatur = donatur?.nama_lengkap ?? trx.nama_donatur ?? '';

    await txExecute(
      conn,
      'DELETE FROM ajis_input_donasi WHERE transid = ? AND detailid = ?',
      [transid, detailid],
    );

    const now = new Date();
    const values = payload.rows.map(r => {
      const a = snapshots.get(r.id_anak)!;
      return [
        // Rebuilt server-side; a client-supplied key here would silently attach the
        // donation to the wrong pairing.
        idPemasanganBaru(r.id_anak, trx.did, tahun),
        trx.tgl_transaksi,
        r.id_anak,
        trx.did,
        r.program_donasi || trx.nama_program,
        r.qty,
        r.pilihan_donasi,
        r.nominal_donasi,
        String(bulan),
        tahun,
        session.username,
        now,
        '',
        now,
        transid,
        detailid,
        r.kantor_id,
        r.id_wilayah_pembinaan,
        'trans',
        a.jenjang_pendidikan ?? '',
        a.jns_kel ?? '',
        a.asnaf ?? '',
        '',
        a.nik ?? '',
        a.nama_lengkap ?? '',
        namaDonatur,
        a.nama_wilayah ?? '',
        a.nama_kantor ?? '',
        per,
        r.id_program || String(trx.id_program ?? ''),
        'reguler',
        '',
      ];
    });

    // One multi-row INSERT instead of N single-row inserts.
    await txQueryUnprepared(
      conn,
      `INSERT INTO ajis_input_donasi
        (id_pemasangan_baru, tgl_transaksi, id_anak, id_donatur, program_donasi,
         qty, pilihan_donasi, nominal_donasi, bulan, tahun,
         user_insert, date_insert, user_update, date_update,
         transid, detailid, kantor_id, id_wilayah_pembinaan, jenis,
         jenjang_pendidikan, jns_kel, asnaf, id_pemasangan, nik,
         nama_anak, nama_donatur, nama_wilayah, nama_kantor,
         periode, id_program, via_input, id_pemasangan_new)
       VALUES ?`,
      [values],
    );

    const { total, selisih } = await recalcTransaksi(conn, transid, detailid, {
      username: session.username,
      mode:     payload.mode,
    });

    return {
      transid,
      detailid,
      rows_inserted:      values.length,
      total_input_donasi: total,
      selisih_donasi:     selisih,
      periode:            per,
    };
  });
}

/**
 * Approve Salur — sets the salur period and wipes any existing split.
 *
 * The wipe is legacy behaviour and is intentional: changing the salur month invalidates
 * the entry that was made against the old one.
 *
 * Legacy stopped there, which left `status_pasang='y'` and a stale `total_input_donasi`
 * behind on a transaction that now has no rows at all — permanently blocking Entry CF
 * through its own not-yet-entered guard. The rollup is reset here so the transaction
 * returns to a re-enterable state, matching what legacy's own `d` (delete entry) path did.
 */
export async function approveSalur(
  transid: string,
  detailid: number,
  input: ApproveSalurInput,
  session: SessionData,
): Promise<{ deleted_entries: number }> {
  return withTransaction(async conn => {
    await lockTransaksi(conn, transid, detailid, session);

    await txExecute(
      conn,
      `UPDATE transaksi
       SET bulan_salur        = ?,
           tahun_salur        = ?,
           approve_salur      = ?,
           ket_approve_salur  = ?,
           cicilan            = ?,
           user_approve_salur = ?,
           date_approve_salur = NOW()
       WHERE transid = ? AND detailid = ?`,
      [
        String(input.bulan_salur),
        input.tahun_salur,
        input.approve_salur,
        input.ket_approve_salur,
        input.cicilan,
        session.username,
        transid,
        detailid,
      ],
    );

    const del = await txExecuteResult(
      conn,
      'DELETE FROM ajis_input_donasi WHERE transid = ? AND detailid = ?',
      [transid, detailid],
    );

    await txExecute(
      conn,
      `UPDATE transaksi
       SET status_pasang      = 'n',
           total_input_donasi = 0,
           selisih_donasi     = perkiraan_rp
       WHERE transid = ? AND detailid = ?`,
      [transid, detailid],
    );

    return { deleted_entries: del.affectedRows };
  });
}

/**
 * Bulk approve from the Review tab, keyed on `id_review` (= CONCAT(transid, detailid)).
 *
 * Unlike the single-row path this does not delete splits: rows in the review queue have
 * not been entered yet, so there is nothing to invalidate.
 */
export async function approveReviewBulk(
  input: ReviewApproveInput,
  session: SessionData,
): Promise<{ updated: number }> {
  return withTransaction(async conn => {
    const scope = getTransaksiScope(session, 'a');
    const placeholders = input.id_review.map(() => '?').join(',');

    const res = await txExecuteResult(
      conn,
      `UPDATE transaksi a
       SET a.review             = 'y',
           a.bulan_salur        = ?,
           a.tahun_salur        = ?,
           a.approve_salur      = ?,
           a.ket_approve_salur  = ?,
           a.cicilan            = ?,
           a.user_approve_salur = ?,
           a.date_approve_salur = NOW()
       WHERE a.id_review IN (${placeholders}) AND ${scope.sql}`,
      [
        String(input.bulan_salur),
        input.tahun_salur,
        input.approve_salur,
        input.ket_approve_salur,
        input.cicilan,
        session.username,
        ...input.id_review,
        ...scope.params,
      ],
    );

    return { updated: res.affectedRows };
  });
}

/**
 * Ganti Program — repoints the transaction at another program and re-syncs the two
 * denormalised columns from `setting_program` in the same statement, so they can never
 * be left describing the previous program.
 */
export async function gantiProgram(
  transid: string,
  detailid: number,
  idProgram: number,
  session: SessionData,
): Promise<{ nama_program: string; harga_program: number }> {
  return withTransaction(async conn => {
    await lockTransaksi(conn, transid, detailid, session);

    const program = await txQueryOne<{
      id_program: number; progid: string; nama_program: string; harga_program: number;
    }>(
      conn,
      `SELECT id_program, progid, nama_program, harga_program
       FROM setting_program
       WHERE id_program = ? AND aktif = 'y'
       LIMIT 1`,
      [idProgram],
    );

    if (!program) {
      throw new RuleError('Program tidak ditemukan atau sudah tidak aktif.');
    }

    await txExecute(
      conn,
      `UPDATE transaksi
       SET id_program    = ?,
           progid        = ?,
           nama_program  = ?,
           harga_program = ?
       WHERE transid = ? AND detailid = ?`,
      [program.id_program, program.progid, program.nama_program, program.harga_program,
       transid, detailid],
    );

    return { nama_program: program.nama_program, harga_program: Number(program.harga_program) };
  });
}

/** Delete every split of a transaction and reset its rollup (legacy `d`). */
export async function deleteEntries(
  transid: string,
  detailid: number,
  session: SessionData,
): Promise<{ deleted: number }> {
  return withTransaction(async conn => {
    await lockTransaksi(conn, transid, detailid, session);

    const del = await txExecuteResult(
      conn,
      'DELETE FROM ajis_input_donasi WHERE transid = ? AND detailid = ?',
      [transid, detailid],
    );

    await txExecute(
      conn,
      `UPDATE transaksi
       SET status_pasang      = 'n',
           total_input_donasi = 0,
           selisih_donasi     = perkiraan_rp,
           user_update_cf     = ?
       WHERE transid = ? AND detailid = ?`,
      [session.username, transid, detailid],
    );

    return { deleted: del.affectedRows };
  });
}

/**
 * Permanent delete of the transaction row (legacy `de`).
 *
 * Its splits go with it. Legacy removed only the `transaksi` row, orphaning the
 * `ajis_input_donasi` rows — which the saldo and laporan-semester queries read directly,
 * so the money kept counting against children after the transaction was gone.
 */
export async function deleteTransaksiPerm(
  transid: string,
  detailid: number,
  session: SessionData,
): Promise<{ deleted_entries: number }> {
  return withTransaction(async conn => {
    await lockTransaksi(conn, transid, detailid, session);

    const del = await txExecuteResult(
      conn,
      'DELETE FROM ajis_input_donasi WHERE transid = ? AND detailid = ?',
      [transid, detailid],
    );

    await txExecute(
      conn,
      'DELETE FROM transaksi WHERE transid = ? AND detailid = ?',
      [transid, detailid],
    );

    return { deleted_entries: del.affectedRows };
  });
}

/** Delete one split row, then recompute the parent rollup (legacy `delete_donasi`). */
export async function deleteInputDonasi(
  idInputDonasi: number,
  session: SessionData,
): Promise<{ transid: string; detailid: number; total_input_donasi: number; selisih_donasi: number }> {
  return withTransaction(async conn => {
    const row = await txQueryOne<{ transid: string; detailid: number; kantor_id: string }>(
      conn,
      `SELECT transid, detailid, kantor_id
       FROM ajis_input_donasi
       WHERE id_input_donasi = ?
       LIMIT 1`,
      [idInputDonasi],
    );

    if (!row) {
      throw new RuleError('Baris input donasi tidak ditemukan.');
    }

    // Reuse the transaction-level scope so a branch cannot delete a split belonging to
    // a transaction it is not allowed to see.
    await lockTransaksi(conn, row.transid, row.detailid, session);

    await txExecute(
      conn,
      'DELETE FROM ajis_input_donasi WHERE id_input_donasi = ?',
      [idInputDonasi],
    );

    const { total, selisih } = await recalcTransaksi(conn, row.transid, row.detailid, {
      username: session.username,
      mode:     'update',
    });

    return {
      transid:            row.transid,
      detailid:           row.detailid,
      total_input_donasi: total,
      selisih_donasi:     selisih,
    };
  });
}
