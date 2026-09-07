/**
 * lib/input-donasi/mutations.ts — writes for the Input Donasi module.
 *
 * New Single (PRD §5.2), rebuilt to fix the seven legacy defects instead of moving
 * them: `id_input_donasi` is left to AUTO_INCREMENT (never MAX()+1); `transid` is a
 * single value (never CSV) with `detailid` required; `periode`/`jenis='trans'`/
 * `via_input` are always filled so the row counts toward the child's saldo;
 * denormalised names come from one snapshot read, not an unfiltered UPDATE-JOIN; and
 * `transaksi.total_input_donasi`/`selisih_donasi` are recalculated in the same
 * transaction (mirrors lib/transaksi/mutations.ts::recalcTransaksi).
 */
import {
  withTransaction, txQueryOne, txExecute, txExecuteResult, type TxConnection,
} from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import { RuleError, idPemasanganBaru, periode } from '@/lib/transaksi/rules';
import type { NewSinglePayload } from '@/lib/input-donasi/schema';

interface AnakSnapshot {
  nama_lengkap: string; nik: string; nama_wilayah: string; nama_kantor: string;
  jenjang_pendidikan: string; jns_kel: string; asnaf: string;
}

async function recalcTransaksi(
  conn: TxConnection, transid: string, detailid: number, username: string,
): Promise<void> {
  const sumRow = await txQueryOne<{ total: number | null }>(
    conn,
    `SELECT COALESCE(SUM(nominal_donasi), 0) AS total
     FROM ajis_input_donasi WHERE transid = ? AND detailid = ?`,
    [transid, detailid],
  );
  const total = Math.round(Number(sumRow?.total ?? 0));

  await txExecute(
    conn,
    `UPDATE transaksi
     SET status_pasang = ?, user_update_cf = ?,
         total_input_donasi = ?, selisih_donasi = perkiraan_rp - ?
     WHERE transid = ? AND detailid = ?`,
    [total > 0 ? 'y' : 'n', username, total, total, transid, detailid],
  );
}

export interface NewSingleResult {
  id_input_donasi: number;
  periode: 'ganjil' | 'genap';
}

export async function createSingleDonasi(
  payload: NewSinglePayload, session: SessionData,
): Promise<NewSingleResult> {
  return withTransaction(async conn => {
    const trx = await txQueryOne<{ perkiraan_rp: number; total_input_donasi: number }>(
      conn,
      `SELECT perkiraan_rp, total_input_donasi FROM transaksi
       WHERE transid = ? AND detailid = ? LIMIT 1 FOR UPDATE`,
      [payload.transid, payload.detailid],
    );
    if (!trx) {
      throw new RuleError('Transaksi tidak ditemukan.');
    }
    const sisa = Number(trx.perkiraan_rp) - Number(trx.total_input_donasi);
    const nominal = payload.qty * payload.pilihanDonasi;
    if (nominal > sisa + 0.01) {
      throw new RuleError(
        `Nominal (${nominal.toLocaleString('id-ID')}) melebihi sisa transaksi ` +
        `(${sisa.toLocaleString('id-ID')}).`,
      );
    }

    const anak = await txQueryOne<AnakSnapshot>(
      conn,
      `SELECT nama_lengkap, nik, nama_wilayah, nama_kantor, jenjang_pendidikan, jns_kel, asnaf
       FROM ajis_anak WHERE id_anak = ? LIMIT 1`,
      [payload.idAnak],
    );
    if (!anak) {
      throw new RuleError('Anak tidak ditemukan di master.');
    }

    const donatur = await txQueryOne<{ nama_lengkap: string }>(
      conn, 'SELECT nama_lengkap FROM donatur WHERE did = ? LIMIT 1', [payload.did],
    );

    const per = periode(payload.bulan);
    const now = new Date();

    const result = await txExecuteResult(
      conn,
      `INSERT INTO ajis_input_donasi
        (id_pemasangan_baru, tgl_transaksi, id_anak, id_donatur, program_donasi,
         qty, pilihan_donasi, nominal_donasi, bulan, tahun,
         user_insert, date_insert, user_update, date_update,
         transid, detailid, kantor_id, id_wilayah_pembinaan, jenis,
         jenjang_pendidikan, jns_kel, asnaf, id_pemasangan, nik,
         nama_anak, nama_donatur, nama_wilayah, nama_kantor,
         periode, id_program, via_input)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idPemasanganBaru(payload.idAnak, payload.did, payload.tahun),
        payload.tglTransaksi, payload.idAnak, payload.did, payload.programDonasi,
        payload.qty, payload.pilihanDonasi, nominal, String(payload.bulan), String(payload.tahun),
        session.username, now, session.username, now,
        payload.transid, payload.detailid, payload.kantorId, payload.idWilayahPembinaan, 'trans',
        anak.jenjang_pendidikan ?? '', anak.jns_kel ?? '', anak.asnaf ?? '', '', anak.nik ?? '',
        anak.nama_lengkap ?? '', donatur?.nama_lengkap ?? '', anak.nama_wilayah ?? '', anak.nama_kantor ?? '',
        per, payload.idProgram, 'reguler',
      ],
    );

    await recalcTransaksi(conn, payload.transid, payload.detailid, session.username);

    return { id_input_donasi: result.insertId, periode: per };
  });
}

/** Delete one split row (legacy `delete_donasi`), then recompute the parent rollup. */
export async function deleteInputDonasiRow(
  idInputDonasi: number, session: SessionData,
): Promise<{ transid: string; detailid: number }> {
  return withTransaction(async conn => {
    const row = await txQueryOne<{ transid: string; detailid: number }>(
      conn,
      'SELECT transid, detailid FROM ajis_input_donasi WHERE id_input_donasi = ? LIMIT 1',
      [idInputDonasi],
    );
    if (!row) throw new RuleError('Baris input donasi tidak ditemukan.');

    await txExecute(conn, 'DELETE FROM ajis_input_donasi WHERE id_input_donasi = ?', [idInputDonasi]);
    await recalcTransaksi(conn, row.transid, row.detailid, session.username);

    return row;
  });
}
