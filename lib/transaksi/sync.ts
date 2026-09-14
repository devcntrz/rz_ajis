/**
 * lib/transaksi/sync.ts — Get Transid / Get Transid by tgl / Get Donatur.
 *
 * Legacy committed both of these with `REPLACE INTO`, which deletes-then-reinserts the
 * row: any column not present in the payload (`status_pasang`, `review`, `approve_salur`,
 * the approval trail, `bulan_salur`/`tahun_salur`) is silently wiped on every re-sync.
 * Here the write is `INSERT ... ON DUPLICATE KEY UPDATE` naming only the columns that
 * actually come from the external source, so a re-sync can never undo a review/approval
 * that happened locally afterwards. Everything runs inside one `withTransaction`, unlike
 * legacy's unwrapped DELETE→INSERT→UPDATE chain.
 */

import {
  withTransaction,
  txExecute,
  txQuery,
  type TxConnection,
} from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import { fetchTransaksiZ, fetchDonatur } from '@/lib/transaksi/rz-partner-client';
import type {
  SyncTransidSearchQuery,
  SyncDonaturSearchQuery,
  SyncTransidCommitPayload,
  SyncDonaturCommitPayload,
} from '@/lib/transaksi/schema';

/** Fit a value to a fixed-width legacy column instead of letting strict mode reject it. */
function clip(value: string, maxLen: number): string {
  return value.length > maxLen ? value.slice(0, maxLen) : value;
}

/** `date NOT NULL` columns reject '' outright under strict mode; the API can omit a date. */
function dateOrDefault(value: string): string {
  return value.trim() ? value.trim() : '1970-01-01';
}

const JENIS_TRANSAKSI = new Set(['cash', 'noncash', 'bank', 'pccash', 'pcnoncash']);

export async function searchTransidCandidates(query: SyncTransidSearchQuery) {
  return fetchTransaksiZ({
    page:        query.page,
    idTransaksi: query.id_transaksi,
    startDate:   query.start_date,
    endDate:     query.end_date,
  });
}

export async function searchDonaturCandidates(query: SyncDonaturSearchQuery) {
  return fetchDonatur({ idDonatur: query.id_donatur });
}

/** Refresh the denormalised donor name / kantor / IJIS-pairing cache for a set of `did`s. */
async function refreshDenormalizedForDonors(conn: TxConnection, dids: string[]): Promise<void> {
  if (dids.length === 0) return;
  const placeholders = dids.map(() => '?').join(',');

  await txExecute(
    conn,
    `UPDATE transaksi t
     LEFT JOIN donatur b ON t.did = b.did
     SET t.nama_donatur = b.nama_lengkap
     WHERE t.did IN (${placeholders})`,
    dids,
  );

  await txExecute(
    conn,
    `UPDATE transaksi t
     LEFT JOIN (
       SELECT id_donatur,
              GROUP_CONCAT(DISTINCT nama_kantor SEPARATOR ',') AS nama_kantor,
              GROUP_CONCAT(DISTINCT kantor_id  SEPARATOR ',') AS id_kantor_ijis,
              COUNT(id_anak) AS jml_anak
       FROM ajis_pemasangan
       WHERE status_pasangan = 'y' AND id_donatur IN (${placeholders})
       GROUP BY id_donatur
     ) m ON t.did = m.id_donatur
     SET t.kantor_ijis    = m.nama_kantor,
         t.id_kantor_ijis = m.id_kantor_ijis,
         t.jml_anak_ijis  = m.jml_anak
     WHERE t.did IN (${placeholders})`,
    [...dids, ...dids],
  );
}

export interface CommitTransidResult {
  count: number;
}

/**
 * `transaksi` has dozens of `NOT NULL` columns with no default (a legacy MySQL habit
 * that only worked because the old app ran without strict SQL mode, which let it fall
 * back to MySQL's implicit '' / 0 / zero-date). This app's pool runs with the driver's
 * default (strict) mode, so a brand-new row must supply all of them explicitly. They
 * are listed only in the INSERT column list, never in `ON DUPLICATE KEY UPDATE` — so a
 * re-sync of an existing row can never reset a value (`review`, `approve_salur`, …)
 * that local review/approval work has since set.
 */
export async function commitTransidRows(
  payload: SyncTransidCommitPayload,
  session: SessionData,
): Promise<CommitTransidResult> {
  return withTransaction(async conn => {
    const now = new Date();
    const idProgramList = [...new Set(payload.rows.map(r => r.id_program).filter(id => id > 0))];
    const programMap = await loadProgramMap(conn, idProgramList);

    const idKantorList = [...new Set(
      payload.rows.flatMap(r => [r.id_kantor_transaksi, r.id_kantor_donatur]).filter(Boolean),
    )];
    const namaKantorList = [...new Set(
      payload.rows.flatMap(r => [r.kantor_transaksi, r.kantor_donatur]).filter(Boolean),
    )];
    const kantorMap = await loadKantorMap(conn, idKantorList, namaKantorList);

    for (const row of payload.rows) {
      const program = programMap.get(row.id_program);
      // approved_claim/approved_trans are `enum('y','n')` with no default; the API's
      // approved_transaksi flag doesn't always arrive as exactly 'y'/'n'.
      const approvedClaim = row.approved_claim.trim().toLowerCase() === 'y' ? 'y' : 'n';
      const approvedTrans = row.approved_trans.trim().toLowerCase() === 'y' ? 'y' : 'n';

      const jenisTransaksi = JENIS_TRANSAKSI.has(row.jenis_transaksi) ? row.jenis_transaksi : 'bank';
      const oidTransaksi = resolveKantorOid(kantorMap, row.oid_transaksi, row.id_kantor_transaksi, row.kantor_transaksi);
      const oidDonatur   = resolveKantorOid(kantorMap, row.oid_donatur, row.id_kantor_donatur, row.kantor_donatur);

      await txExecute(
        conn,
        `INSERT INTO transaksi
           (transid, jenis_transaksi, did, detailid, progid, id_program, nama_program,
            harga_program, perkiraan_rp, tgl_donasi, tgl_transaksi, oid_transaksi, oid_donatur,
            vbayarid, mbayarid, nik_rfo, valid4, nik_claim, jid_claim,
            approved_claim, approved_trans, atas_nama, date_generate, keterangan,
            jml_mustahik, bulan_disantuni, nama_rfo, nama_claim,
            status_pasang, user_insert_cf, user_update_cf,
            approve_salur, ket_approve_salur, user_approve_salur, date_approve_salur,
            deleted_trans, deleted_detail, review, bulan_salur, tahun_salur,
            selisih_donasi, total_input_donasi, nama_donatur,
            kantor_transaksi, kantor_donatur, jml_anak_ijis, kantor_ijis, id_kantor_ijis,
            id_review, cicilan, jcustid, user_insert, date_insert)
         VALUES (?, ?, ?, ?, ?, ?, ?,
                 ?, ?, ?, ?, ?, ?,
                 ?, ?, ?, '', ?, '',
                 ?, ?, ?, ?, ?,
                 ?, '', '', '',
                 'n', '', '',
                 'n', '', '', '1970-01-01 00:00:00',
                 'n', 'n', 'n', '', '',
                 ?, 0, '',
                 ?, ?, 0, '', '',
                 ?, 'n', 0, ?, ?)
         ON DUPLICATE KEY UPDATE
           jenis_transaksi  = VALUES(jenis_transaksi),
           did              = VALUES(did),
           progid           = VALUES(progid),
           id_program       = VALUES(id_program),
           nama_program     = VALUES(nama_program),
           harga_program    = VALUES(harga_program),
           perkiraan_rp     = VALUES(perkiraan_rp),
           tgl_donasi       = VALUES(tgl_donasi),
           tgl_transaksi    = VALUES(tgl_transaksi),
           oid_transaksi    = VALUES(oid_transaksi),
           oid_donatur      = VALUES(oid_donatur),
           vbayarid         = VALUES(vbayarid),
           mbayarid         = VALUES(mbayarid),
           nik_rfo          = VALUES(nik_rfo),
           nik_claim        = VALUES(nik_claim),
           approved_claim   = VALUES(approved_claim),
           approved_trans   = VALUES(approved_trans),
           atas_nama        = VALUES(atas_nama),
           keterangan       = VALUES(keterangan),
           jml_mustahik     = VALUES(jml_mustahik),
           kantor_transaksi = VALUES(kantor_transaksi),
           kantor_donatur   = VALUES(kantor_donatur)`,
        [
          row.transid, jenisTransaksi, row.did, row.detailid, clip(program?.progid ?? '', 6), row.id_program, row.nama_program,
          program?.harga_program ?? 0, row.perkiraan_rp,
          dateOrDefault(row.tgl_donasi), dateOrDefault(row.tgl_transaksi),
          oidTransaksi, oidDonatur,
          clip(row.vbayarid, 100), clip(row.mbayarid, 100), clip(row.nik_rfo, 15), clip(row.nik_claim, 14),
          approvedClaim, approvedTrans, row.atas_nama, now, row.keterangan,
          clip(row.jml_mustahik, 50),
          row.perkiraan_rp,
          row.kantor_transaksi, row.kantor_donatur,
          `${row.transid}${row.detailid}`, session.username, now,
        ],
      );
    }

    const dids = [...new Set(payload.rows.map(r => r.did).filter(Boolean))];
    await refreshDenormalizedForDonors(conn, dids);

    return { count: payload.rows.length };
  });
}

interface ProgramInfo {
  progid: string;
  harga_program: number;
}

async function loadProgramMap(conn: TxConnection, idProgramList: number[]): Promise<Map<number, ProgramInfo>> {
  if (idProgramList.length === 0) return new Map();
  const placeholders = idProgramList.map(() => '?').join(',');
  const rows = await txQuery<{ id_program: number; progid: string; harga_program: number }>(
    conn,
    `SELECT id_program, progid, harga_program FROM setting_program WHERE id_program IN (${placeholders})`,
    idProgramList,
  );
  return new Map(rows.map(r => [r.id_program, { progid: r.progid, harga_program: r.harga_program }]));
}

interface KantorMap {
  byIdKantor: Map<string, string>;
  byNama:     Map<string, string>;
}

/**
 * `kantor.oid` is what `transaksi.oid_transaksi`/`oid_donatur` actually key against, but
 * the RZ API doesn't send an oid — only `id_kantor_*` (matches `kantor.id_kantor`) and a
 * free-text kantor name (matched case-insensitively against `kantor.kantor` as a fallback,
 * since the API's spelling isn't guaranteed to line up exactly).
 */
async function loadKantorMap(
  conn: TxConnection,
  idKantorList: string[],
  namaKantorList: string[],
): Promise<KantorMap> {
  const byIdKantor = new Map<string, string>();
  const byNama = new Map<string, string>();

  if (idKantorList.length > 0) {
    const placeholders = idKantorList.map(() => '?').join(',');
    const rows = await txQuery<{ id_kantor: number; oid: string }>(
      conn,
      `SELECT id_kantor, oid FROM kantor WHERE id_kantor IN (${placeholders})`,
      idKantorList,
    );
    for (const r of rows) byIdKantor.set(String(r.id_kantor), r.oid);
  }

  if (namaKantorList.length > 0) {
    const placeholders = namaKantorList.map(() => '?').join(',');
    const rows = await txQuery<{ kantor: string; oid: string }>(
      conn,
      `SELECT kantor, oid FROM kantor WHERE kantor IN (${placeholders})`,
      namaKantorList,
    );
    for (const r of rows) byNama.set(r.kantor.trim().toLowerCase(), r.oid);
  }

  return { byIdKantor, byNama };
}

/** oid_transaksi/oid_donatur is a plain varchar(6), not a FK — an unmatched kantor still commits. */
function resolveKantorOid(map: KantorMap, oidFromApi: string, idKantor: string, namaKantor: string): string {
  if (oidFromApi) return clip(oidFromApi, 6);
  if (idKantor && map.byIdKantor.has(idKantor)) return map.byIdKantor.get(idKantor)!;
  const byName = map.byNama.get(namaKantor.trim().toLowerCase());
  return byName ?? '';
}

export interface CommitDonaturResult {
  count: number;
}

const DONATUR_STATUS = new Set(['d', 'oc', 'upz', 'm', 'doc', 'dupz', 'dm', 'ocm', 'upzm', 'docm', 'dupzm']);
const DONATUR_AKTIF = new Set(['y', 'n', 'p']);
const DONATUR_JK = new Set(['l', 'p', 't']);

/**
 * `donatur` has the same "NOT NULL, no default" legacy shape as `transaksi` (see the
 * comment on `commitTransidRows`) plus several columns typed as a fixed `enum`, which
 * strict mode rejects outright if the API's value isn't one of the declared members —
 * unlike a plain varchar, there's no clipping that fixes an invalid enum value, so
 * these fall back to a safe member instead.
 */
export async function commitDonaturRows(
  payload: SyncDonaturCommitPayload,
  session: SessionData,
): Promise<CommitDonaturResult> {
  return withTransaction(async conn => {
    for (const row of payload.rows) {
      const status = DONATUR_STATUS.has(row.status.trim().toLowerCase()) ? row.status.trim().toLowerCase() : 'd';
      const aktif = DONATUR_AKTIF.has(row.aktif.trim().toLowerCase()) ? row.aktif.trim().toLowerCase() : 'n';
      const jk = DONATUR_JK.has(row.jenis_kelamin.trim().toLowerCase()) ? row.jenis_kelamin.trim().toLowerCase() : 't';
      const verifikasi1 = row.verifikasi1.trim().toLowerCase() === 'y' ? 1 : 0;

      await txExecute(
        conn,
        `INSERT INTO donatur
           (did, nama_lengkap, nama_publikasi, tgl_lahir, alamat_lengkap, alamat_silaturahmi,
            camatid, kabid, propid, jcustid, status, tgl_registrasi, aktif, kirim_sms,
            telp, fax, hp, email, website, verifikasi1, verifikasi2, jenis_kelamin,
            kecamatan_domisili, camatid_silaturahmi, kecamatan_silaturahmi,
            nama_kontak, telp_kontak, email_kontak, jabatan_kontak,
            nama_bank, no_rek, omid_donatur, oid_donatur, kantor_donatur,
            nia_rfo, nama_rfo, user_name, tipe_pelayanan, user_insert,
            periode_rutinitas_transaksiid, sumber_informasi, jalur_komunikasi,
            user_update, tgl_update, tag, npwp, cat1, cat2, updated)
         VALUES (?, ?, ?, ?, ?, ?,
                 '', '', '', 0, ?, ?, ?, 'n',
                 ?, '', ?, ?, '', ?, 0, ?,
                 '', '', '',
                 '', '', '', '',
                 '', '', '', '', '',
                 ?, ?, '', '', ?,
                 0, '', '',
                 ?, NOW(), '', ?, '', '', NOW())
         ON DUPLICATE KEY UPDATE
           nama_lengkap       = VALUES(nama_lengkap),
           nama_publikasi     = VALUES(nama_publikasi),
           tgl_lahir          = VALUES(tgl_lahir),
           alamat_lengkap     = VALUES(alamat_lengkap),
           alamat_silaturahmi = VALUES(alamat_silaturahmi),
           status             = VALUES(status),
           tgl_registrasi     = VALUES(tgl_registrasi),
           aktif              = VALUES(aktif),
           telp               = VALUES(telp),
           hp                 = VALUES(hp),
           email              = VALUES(email),
           verifikasi1        = VALUES(verifikasi1),
           jenis_kelamin      = VALUES(jenis_kelamin),
           nia_rfo            = VALUES(nia_rfo),
           nama_rfo           = VALUES(nama_rfo),
           user_update        = VALUES(user_update),
           tgl_update         = NOW(),
           npwp               = VALUES(npwp)`,
        [
          row.did, clip(row.nama_lengkap, 50), clip(row.nama_publikasi, 50), dateOrDefault(row.tgl_lahir),
          row.alamat_lengkap, row.alamat_silaturahmi,
          status, dateOrDefault(row.tgl_registrasi), aktif,
          clip(row.telp, 30), clip(row.hp, 30), clip(row.email, 100), verifikasi1, jk,
          clip(row.nia_rfo, 15), clip(row.nama_rfo, 50), session.username,
          session.username, clip(row.npwp, 30),
        ],
      );
    }

    const dids = [...new Set(payload.rows.map(r => r.did).filter(Boolean))];
    await refreshDenormalizedForDonors(conn, dids);

    return { count: payload.rows.length };
  });
}
