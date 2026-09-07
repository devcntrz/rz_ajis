/**
 * lib/penyaluran/mutations.ts — writes for the Penyaluran module.
 *
 * Fixes over legacy (PRD §7.4, §7.8), not reproductions:
 *  - `id_penyaluran` generated server-side, inside the transaction (never client `autonumber()`).
 *  - Duplicate batch (same wilayah+bulan+tahun) rejected instead of silently duplicated
 *    (`INSERT IGNORE` on a table whose `id_row` is always fresh never actually blocks a dupe).
 *  - Double-salur prevented via lib/penyaluran/candidates.ts::alreadySalur, and the count
 *    skipped is reported back instead of disappearing silently.
 *  - Denormalised columns are written directly in the INSERT (one batch statement),
 *    never via a follow-up UPDATE-JOIN with no row filter.
 *  - `periode` is always derived from `bulan` server-side — never hardcoded 'ganjil'
 *    (the legacy New Single defect that miscounted every Jul-Dec entry).
 *  - "Edit baris" is a new feature (no legacy equivalent): only nominal/bulan/tahun may
 *    change, a reason is mandatory, and `periode` is recomputed when `bulan` changes.
 */
import {
  withTransaction, txQueryOne, txExecute, txExecuteResult, txQueryUnprepared,
  type TxConnection,
} from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import { RuleError, periode } from '@/lib/transaksi/rules';
import { kandidatSalur, alreadySalur } from '@/lib/penyaluran/candidates';
import { revalidatePenyaluranCache } from '@/lib/penyaluran/queries';
import type { NewBulkInput, EditRowInput, TeknisInput } from '@/lib/penyaluran/schema';
import type { NewBulkResult } from '@/types/penyaluran';

function generateIdPenyaluran(wilayahId: string, bulan: number, tahun: number): string {
  return `${wilayahId}${tahun}${String(bulan).padStart(2, '0')}`;
}

/** New Bulk — one wilayah × one bulan. PRD §5.3 / §7.4. */
export async function createBulkPenyaluran(
  input: NewBulkInput, session: SessionData,
): Promise<NewBulkResult> {
  return withTransaction(async conn => {
    const idPenyaluran = generateIdPenyaluran(input.wilayahId, input.bulan, input.tahun);

    const existing = await txQueryOne<{ id_penyaluran: string }>(
      conn, 'SELECT id_penyaluran FROM ajis_penyaluran WHERE id_penyaluran = ? LIMIT 1',
      [idPenyaluran],
    );
    if (existing) {
      throw new RuleError(
        'Batch penyaluran untuk wilayah, bulan, dan tahun ini sudah ada. ' +
        'Gunakan New Single untuk menambah anak, atau pilih bulan lain.',
      );
    }

    const kandidat = await kandidatSalur({
      kantorId: input.kantorId, wilayahId: input.wilayahId,
      tahun: input.tahun, bulan: input.bulan, limit: 5000,
    });
    if (kandidat.length === 0) {
      throw new RuleError('Tidak ada anak yang layak disalurkan untuk wilayah/bulan ini.');
    }

    const sudah = await alreadySalur(kandidat.map(k => k.id_anak), input.bulan, input.tahun);
    const final = kandidat.filter(k => !sudah.has(k.id_anak));
    if (final.length === 0) {
      throw new RuleError('Seluruh anak kandidat sudah menerima penyaluran bulan ini.');
    }

    const per = periode(input.bulan);
    const now = new Date();

    const values = final.map(k => [
      idPenyaluran, k.id_pemasangan_baru, k.id_anak, k.jenjang_pendidikan, k.kelas,
      k.id_donatur, k.id_wilayah_pembinaan, k.kantor_id, k.program_donasi,
      session.username, now, String(input.bulan), String(input.tahun), k.jns_kel, k.asnaf,
      k.nama_anak, k.nama_donatur, k.nama_wilayah, k.nama_kantor,
      k.no_rekening ?? '', k.nama_bank ?? '', k.pemilik_rekening ?? '', k.nik, per,
      k.harga_program, k.harga_penyaluran, 'massal',
    ]);

    await txQueryUnprepared(
      conn,
      `INSERT INTO ajis_penyaluran
        (id_penyaluran, id_pemasangan_baru, id_anak, jenjang_pendidikan, kelas,
         id_donatur, id_wilayah_pembinaan, id_kantor, program_donasi,
         user_insert, date_insert, bulan, tahun, jns_kel, asnaf,
         nama_anak, nama_donatur, nama_wilayah, nama_kantor,
         no_rekening, nama_bank, pemilik_rekening, nik, periode,
         nominal_penyaluran, nominal_hpp, via_input)
       VALUES ?`,
      [values],
    );

    return { id_penyaluran: idPenyaluran, jumlah_anak: final.length, dilewati: kandidat.length - final.length };
  }).then(async result => {
    await revalidatePenyaluranCache(result.id_penyaluran);
    return result;
  });
}

/** New Single — tambah satu anak ke batch yang sudah ada. PRD §5.4 (memperbaiki hardcode periode). */
export async function createSingleRow(
  idPenyaluran: string, idAnak: string, session: SessionData,
): Promise<{ id_row: number }> {
  return withTransaction(async conn => {
    const batch = await txQueryOne<{
      id_wilayah_pembinaan: string; id_kantor: string; bulan: string; tahun: string;
    }>(
      conn,
      `SELECT id_wilayah_pembinaan, id_kantor, bulan, tahun
       FROM ajis_penyaluran WHERE id_penyaluran = ? LIMIT 1`,
      [idPenyaluran],
    );
    if (!batch) throw new RuleError('Batch penyaluran tidak ditemukan.');

    const bulan = Number(batch.bulan);
    const tahun = Number(batch.tahun);

    const dup = await txQueryOne<{ id_row: number }>(
      conn, 'SELECT id_row FROM ajis_penyaluran WHERE id_penyaluran = ? AND id_anak = ? LIMIT 1',
      [idPenyaluran, idAnak],
    );
    if (dup) throw new RuleError('Anak ini sudah ada dalam batch.');

    const sudah = await alreadySalur([idAnak], bulan, tahun);
    if (sudah.has(idAnak)) {
      throw new RuleError('Anak ini sudah menerima penyaluran pada bulan/tahun tersebut.');
    }

    const kandidat = await kandidatSalur({
      kantorId: batch.id_kantor, wilayahId: batch.id_wilayah_pembinaan,
      tahun, bulan, q: idAnak, limit: 5,
    });
    const k = kandidat.find(c => c.id_anak === idAnak);
    if (!k) throw new RuleError('Anak tidak memenuhi kriteria layak salur.');

    const per = periode(bulan);
    const now = new Date();

    const result = await txExecuteResult(
      conn,
      `INSERT INTO ajis_penyaluran
        (id_penyaluran, id_pemasangan_baru, id_anak, jenjang_pendidikan, kelas,
         id_donatur, id_wilayah_pembinaan, id_kantor, program_donasi,
         user_insert, date_insert, bulan, tahun, jns_kel, asnaf,
         nama_anak, nama_donatur, nama_wilayah, nama_kantor,
         no_rekening, nama_bank, pemilik_rekening, nik, periode,
         nominal_penyaluran, nominal_hpp, via_input)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idPenyaluran, k.id_pemasangan_baru, k.id_anak, k.jenjang_pendidikan, k.kelas,
        k.id_donatur, k.id_wilayah_pembinaan, k.kantor_id, k.program_donasi,
        session.username, now, String(bulan), String(tahun), k.jns_kel, k.asnaf,
        k.nama_anak, k.nama_donatur, k.nama_wilayah, k.nama_kantor,
        k.no_rekening ?? '', k.nama_bank ?? '', k.pemilik_rekening ?? '', k.nik, per,
        k.harga_program, k.harga_penyaluran, 'single',
      ],
    );

    return { id_row: result.insertId };
  }).then(async result => {
    await revalidatePenyaluranCache(idPenyaluran);
    return result;
  });
}

async function assertBatchNotLocked(conn: TxConnection, idPenyaluran: string): Promise<void> {
  const batch = await txQueryOne<{ status_akhir: string | null }>(
    conn, 'SELECT status_akhir FROM ajis_penyaluran WHERE id_penyaluran = ? LIMIT 1', [idPenyaluran],
  );
  if (batch?.status_akhir === 'y') {
    throw new RuleError('Batch ini sudah dikunci (Pasca Penyaluran) dan tidak dapat diubah lagi.');
  }
}

/** Hapus baris (legacy `delete` / `pengembalian`, satu endpoint). */
export async function deleteRow(idPenyaluran: string, idRow: number): Promise<void> {
  await withTransaction(async conn => {
    await assertBatchNotLocked(conn, idPenyaluran);
    const res = await txExecuteResult(
      conn, 'DELETE FROM ajis_penyaluran WHERE id_penyaluran = ? AND id_row = ?',
      [idPenyaluran, idRow],
    );
    if (res.affectedRows === 0) throw new RuleError('Baris penyaluran tidak ditemukan.');
  });
  await revalidatePenyaluranCache(idPenyaluran);
}

async function txExecuteWrap(sql: string, params: unknown[]) {
  return withTransaction(conn => txExecuteResult(conn, sql, params));
}

/** Edit baris — fitur baru (PRD §5.5), tidak ada di legacy. */
export async function editRow(
  idPenyaluran: string, idRow: number, input: EditRowInput,
): Promise<void> {
  await withTransaction(async conn => {
    await assertBatchNotLocked(conn, idPenyaluran);

    const row = await txQueryOne<{ bulan: string; tahun: string }>(
      conn,
      'SELECT bulan, tahun FROM ajis_penyaluran WHERE id_penyaluran = ? AND id_row = ? LIMIT 1 FOR UPDATE',
      [idPenyaluran, idRow],
    );
    if (!row) throw new RuleError('Baris penyaluran tidak ditemukan.');

    const nextBulan = input.bulan ?? Number(row.bulan);
    const nextTahun = input.tahun ?? Number(row.tahun);
    const nextPeriode = periode(nextBulan);

    const sets: string[] = ['bulan = ?', 'tahun = ?', 'periode = ?'];
    const params: unknown[] = [String(nextBulan), String(nextTahun), nextPeriode];

    if (input.nominalPenyaluran !== undefined) {
      sets.push('nominal_penyaluran = ?');
      params.push(input.nominalPenyaluran);
    }
    if (input.nominalHpp !== undefined) {
      sets.push('nominal_hpp = ?');
      params.push(input.nominalHpp);
    }

    await txExecute(
      conn,
      `UPDATE ajis_penyaluran SET ${sets.join(', ')}
       WHERE id_penyaluran = ? AND id_row = ?`,
      [...params, idPenyaluran, idRow],
    );
  });
  await revalidatePenyaluranCache(idPenyaluran);
}

/** Update Tgl-SDM (Teknis Penyaluran) — seluruh batch. */
export async function teknisPenyaluran(
  idPenyaluran: string, input: TeknisInput,
): Promise<{ id_penyaluran: string }> {
  return withTransaction(async conn => {
    const nextId = input.idPenyaluranBaru?.trim() || idPenyaluran;

    if (nextId !== idPenyaluran) {
      const clash = await txQueryOne<{ id_penyaluran: string }>(
        conn, 'SELECT id_penyaluran FROM ajis_penyaluran WHERE id_penyaluran = ? LIMIT 1',
        [nextId],
      );
      if (clash) throw new RuleError('ID Penyaluran baru sudah dipakai batch lain.');
    }

    const res = await txExecuteResult(
      conn,
      `UPDATE ajis_penyaluran
       SET id_penyaluran = ?, tgl_penyaluran = ?, id_sdm = ?
       WHERE id_penyaluran = ?`,
      [nextId, input.tglPenyaluran, input.idSdm, idPenyaluran],
    );
    if (res.affectedRows === 0) throw new RuleError('Batch penyaluran tidak ditemukan.');

    return { id_penyaluran: nextId };
  }).then(async result => {
    await revalidatePenyaluranCache(idPenyaluran);
    if (result.id_penyaluran !== idPenyaluran) await revalidatePenyaluranCache(result.id_penyaluran);
    return result;
  });
}

/** Pasca Penyaluran — kunci batch (status_akhir='y'), satu arah, sesuai legacy. */
export async function pascaPenyaluran(idPenyaluran: string): Promise<void> {
  const res = await txExecuteWrap(
    `UPDATE ajis_penyaluran SET status_akhir = 'y' WHERE id_penyaluran = ?`,
    [idPenyaluran],
  );
  if (res.affectedRows === 0) throw new RuleError('Batch penyaluran tidak ditemukan.');
  await revalidatePenyaluranCache(idPenyaluran);
}
