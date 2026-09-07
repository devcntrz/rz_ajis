/**
 * lib/penyaluran/queries.ts — read paths for the Penyaluran module.
 *
 * Grid batch (tab Wilayah) uses one aggregate query (PRD §7.3) instead of legacy's 17
 * per-row sub-queries. Detail batch and tab Anak read straight from `ajis_penyaluran`
 * with an explicit column list (never `ap.*` on a 39-column table).
 */
import { query, queryOne } from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import { getKantorScope } from '@/lib/auth';
import type { BatchListQuery, AnakListQuery } from '@/lib/penyaluran/schema';
import type { PenyaluranBatch, PenyaluranRow } from '@/types/penyaluran';

const ROW_COLUMNS = `
  ap.id_row, ap.id_penyaluran, ap.id_pemasangan_baru, ap.id_anak, ap.nama_anak, ap.nik,
  ap.jenjang_pendidikan, ap.kelas, ap.jns_kel, ap.asnaf, ap.id_donatur, ap.nama_donatur,
  ap.id_kantor, ap.nama_kantor, ap.id_wilayah_pembinaan, ap.nama_wilayah,
  ap.program_donasi, ap.nominal_penyaluran, ap.nominal_hpp, ap.bulan, ap.tahun, ap.periode,
  ap.via_input, ap.tgl_penyaluran, ap.no_rekening, ap.nama_bank, ap.pemilik_rekening`;

/** `ajis_penyaluran` scopes by `id_kantor`, unlike `ajis_anak`/`ajis_pemasangan` (`kantor_id`). */
function batchScope(session: SessionData) {
  const { sql, params } = getKantorScope(session, 'id_kantor', 'ap');
  return { sql, params };
}

export async function fetchBatchList(q: BatchListQuery, session: SessionData) {
  const scope = batchScope(session);
  const conditions = [scope.sql];
  const params: unknown[] = [...scope.params];

  if (q.kantor_id) { conditions.push('ap.id_kantor = ?'); params.push(q.kantor_id); }
  if (q.id_wilayah_pembinaan) { conditions.push('ap.id_wilayah_pembinaan = ?'); params.push(q.id_wilayah_pembinaan); }
  if (q.bulan) { conditions.push('ap.bulan = ?'); params.push(String(q.bulan)); }
  if (q.tahun) { conditions.push('ap.tahun = ?'); params.push(String(q.tahun)); }

  const WHERE = conditions.join(' AND ');

  const countRow = await queryOne<{ total: number }>(
    `SELECT COUNT(DISTINCT ap.id_penyaluran) AS total FROM ajis_penyaluran ap WHERE ${WHERE}`,
    params,
  );

  const rows = await query<PenyaluranBatch>(
    `SELECT ap.id_penyaluran, ap.id_kantor, MIN(ap.nama_kantor) AS nama_kantor,
            ap.id_wilayah_pembinaan, MIN(ap.nama_wilayah) AS nama_wilayah,
            MIN(ap.bulan) AS bulan, MIN(ap.tahun) AS tahun, MIN(ap.periode) AS periode,
            MIN(ap.status_akhir) AS status_akhir, MIN(ap.tgl_penyaluran) AS tgl_penyaluran,
            MIN(ap.id_sdm) AS id_sdm, MIN(s.nama_lengkap) AS nama_sdm,
            COUNT(*) AS jumlah_anak,
            SUM(ap.nominal_penyaluran) AS jumlah_penyaluran,
            SUM(ap.nominal_hpp) AS jumlah_hpp,
            SUM(ap.jenjang_pendidikan LIKE '%SD%') AS jumlah_sd,
            SUM(ap.jenjang_pendidikan LIKE '%SMP%') AS jumlah_smp,
            SUM(ap.jenjang_pendidikan LIKE '%SMA%' OR ap.jenjang_pendidikan LIKE '%SMK%') AS jumlah_sma,
            SUM(ap.jenjang_pendidikan LIKE '%Mahasiswa%' OR ap.jenjang_pendidikan LIKE '%PT%') AS jumlah_pt
     FROM ajis_penyaluran ap
     LEFT JOIN ajis_sdm_wilayah s ON CAST(s.id_sdm AS CHAR) = CAST(ap.id_sdm AS CHAR)
     WHERE ${WHERE}
     GROUP BY ap.id_penyaluran
     ORDER BY MIN(ap.tgl_penyaluran) DESC, ap.id_penyaluran DESC
     LIMIT ? OFFSET ?`,
    [...params, q.limit, (q.page - 1) * q.limit],
  );

  return { rows, total: countRow?.total ?? 0 };
}

export async function fetchBatchDetail(
  idPenyaluran: string, session: SessionData,
): Promise<PenyaluranRow[]> {
  const scope = batchScope(session);
  return query<PenyaluranRow>(
    `SELECT ${ROW_COLUMNS}
     FROM ajis_penyaluran ap
     WHERE ap.id_penyaluran = ? AND ${scope.sql}
     ORDER BY ap.nama_anak ASC`,
    [idPenyaluran, ...scope.params],
  );
}

export async function fetchAnakList(q: AnakListQuery, session: SessionData) {
  const scope = batchScope(session);
  const conditions = [scope.sql];
  const params: unknown[] = [...scope.params];

  if (q.q) {
    conditions.push('(ap.nama_anak LIKE ? OR ap.id_anak LIKE ? OR ap.nama_donatur LIKE ?)');
    const like = `%${q.q}%`;
    params.push(like, like, like);
  }
  if (q.kantor_id) { conditions.push('ap.id_kantor = ?'); params.push(q.kantor_id); }
  if (q.id_wilayah_pembinaan) { conditions.push('ap.id_wilayah_pembinaan = ?'); params.push(q.id_wilayah_pembinaan); }
  if (q.bulan) { conditions.push('ap.bulan = ?'); params.push(String(q.bulan)); }
  if (q.tahun) { conditions.push('ap.tahun = ?'); params.push(String(q.tahun)); }
  if (q.via_input) { conditions.push('ap.via_input = ?'); params.push(q.via_input); }

  const WHERE = conditions.join(' AND ');

  const countRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ajis_penyaluran ap WHERE ${WHERE}`,
    params,
  );

  const rows = await query<PenyaluranRow>(
    `SELECT ${ROW_COLUMNS}
     FROM ajis_penyaluran ap
     WHERE ${WHERE}
     ORDER BY ap.nama_anak ASC, ap.id_row DESC
     LIMIT ? OFFSET ?`,
    [...params, q.limit, (q.page - 1) * q.limit],
  );

  return { rows, total: countRow?.total ?? 0 };
}
