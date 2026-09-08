/**
 * lib/laporanSemester/queries.ts — Laporan Semester (Lapsem/Rekap) queries.
 *
 * Ported from `modules/ajis/class/LaporanPembinaanBaruClass.php`:
 *  - fetchLapsemList    ← LaporanPembinaanBaru_Read()   (subset of columns — see
 *                          types/laporan-semester.ts for what was dropped; the
 *                          per-row N+1 sub-queries — getDokumentasiPembinaanWilayah,
 *                          viewSuaraAnakJuarav2 — are not needed for the grid and
 *                          are intentionally skipped here)
 *  - fetchRekapByKantor ← RekapTerbuat()                (consolidated: the legacy
 *                          version issues ~14 separate COUNT queries per office;
 *                          this issues one query with conditional SUM per metric)
 *  - approveLapsem      ← updateManualLaporan() — legacy stored the rendered PDF's
 *                          filename in the misleadingly-named `id_program_postgree`
 *                          column (NULL = not generated); kept as-is since this is
 *                          an existing MySQL column, not a new schema.
 *  - insertManualLaporan ← AnakJuaraBaruClass::AnakJuara_GenerateLapsem/-Insert,
 *                          the canonical "Generate Lapsem" path (NOT the dead
 *                          `generate_pembinaan` router action, whose INSERT is
 *                          commented out in legacy code).
 *
 * `manual_laporan.oid` (child's current office, natural key — matches
 * `ajis_kantor.oid`) is the scoping column here, distinct from `ajis_anak` /
 * `ajis_pemasangan`'s `kantor_id` — `lib/auth.ts#getKantorScope` only knows
 * those two column names, so role scoping is inlined below instead of reusing
 * it, following the same id_group_user 1/2/9 pattern used throughout the app
 * (CLAUDE.md §2.1a role scoping; legacy `LaporanPembinaanBaruClass.php` itself
 * only scopes group 2 via `oid` and never scopes Korwil (group 9) at all — a
 * gap fixed here per the app's own convention, not a legacy behavior to keep).
 *
 * All on MySQL via lib/db.ts (placeholders `?`) — manual_laporan/ajis_semester
 * have no Postgres equivalent (CLAUDE.md §2.1).
 */
import { query, queryOne, execute } from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import type { LapsemListParams, LapsemRow, RekapKantorRow } from '@/types/laporan-semester';

function nameToProgram(programid: string | null): string {
  switch (programid) {
    case '1': return 'Beasiswa Anak Juara SD-SMA';
    case '3': return 'Beasiswa Anak Juara Mahasiswa';
    case '5': return 'Beasiswa Sekolah Juara SD - SMK';
    default: return '';
  }
}

/** Role scope for `manual_laporan`/`ajis_kantor`-joined queries (column `oid`). */
function oidScope(
  session: SessionData,
  alias: string,
): { sql: string; params: unknown[] } {
  const prefix = alias ? `${alias}.` : '';
  if (session.idGroupUser === 1) {
    return { sql: '1=1', params: [] };
  }
  if (session.idGroupUser === 2) {
    return { sql: `${prefix}oid = ?`, params: [session.idKantor] };
  }
  return { sql: `${prefix}id_wilayah_pembinaan = ?`, params: [session.idWilayahPembinaan] };
}

export async function fetchLapsemList(
  filters: LapsemListParams,
  session: SessionData,
): Promise<{ rows: LapsemRow[]; total: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(200, Math.max(1, filters.limit ?? 50));
  const offset = (page - 1) * limit;

  const scope = oidScope(session, 'a');
  const conditions: string[] = [scope.sql, `a.aktif = 'y'`];
  const params: unknown[] = [...scope.params];

  if (filters.q) {
    conditions.push(`(a.pm_nama_lengkap LIKE ? OR a.donatur_nama LIKE ? OR a.donatur_id LIKE ? OR a.laporanid LIKE ? OR a.id_anak LIKE ?)`);
    const like = `%${filters.q}%`;
    params.push(like, like, like, like, like);
  }
  if (filters.kantor_id) {
    conditions.push('a.oid = ?');
    params.push(filters.kantor_id);
  }
  if (filters.id_wilayah_pembinaan) {
    conditions.push('a.id_wilayah_pembinaan = ?');
    params.push(filters.id_wilayah_pembinaan);
  }
  if (filters.semesterid) {
    conditions.push('a.semesterid = ?');
    params.push(filters.semesterid);
  }
  if (filters.keyjenjang) {
    conditions.push('a.pm_anak_jenjang = ?');
    params.push(filters.keyjenjang);
  }
  if (filters.key_approve === 'ya') {
    conditions.push('a.id_program_postgree IS NOT NULL');
  } else if (filters.key_approve === 'tidak') {
    conditions.push('a.id_program_postgree IS NULL');
  }

  const WHERE = conditions.join(' AND ');

  const [{ total }] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM manual_laporan a WHERE ${WHERE}`,
    params,
  );

  const rows = await query<LapsemRow>(
    `SELECT
       a.laporanid, a.id_anak, c.nama_lengkap, a.pm_nama_lengkap, a.jns_kel,
       a.oid, a.nama_kantor, a.id_wilayah_pembinaan, a.nama_wilayah,
       a.semesterid, a.nama_semester, a.programid,
       CASE a.programid
         WHEN '1' THEN 'Beasiswa Anak Juara SD-SMA'
         WHEN '3' THEN 'Beasiswa Anak Juara Mahasiswa'
         WHEN '5' THEN 'Beasiswa Sekolah Juara SD - SMK'
         ELSE ''
       END AS nama_program,
       a.donatur_id, a.donatur_nama,
       ROUND(a.dana_saldo_awal, 0) AS dana_saldo_awal_view,
       ROUND(a.dana_penerimaan, 0) AS dana_penerimaan_view,
       ROUND(a.dana_penyaluran, 0) AS dana_penyaluran_view,
       a.status_terbuat, a.jml_materi, a.id_program_postgree, a.tgl_insert
     FROM manual_laporan a
     LEFT JOIN ajis_anak c ON a.id_anak = c.id_anak
     WHERE ${WHERE}
     GROUP BY a.laporanid
     ORDER BY a.tgl_insert DESC, a.nama_kantor ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { rows, total };
}

/**
 * Per-kantor aggregate, ported from RekapTerbuat(). `jenis_laporan` defaults to
 * 'reguler' — the legacy tab lets the caller pick a jenis_laporan value; the
 * Rekap tab in this pass exposes only the default the grid used most. The
 * "Project" variant (`RekapTerbuatProject`, different `jml_materi` join with a
 * `HAVING COUNT(...)>1`) is not ported — flagged in research as not parallel to
 * the normal variant and out of this pass's scope.
 */
export async function fetchRekapByKantor(
  semesterid: string,
  jenisLaporan: string,
  session: SessionData,
): Promise<RekapKantorRow[]> {
  const scope = oidScope(session, 'k');

  const rows = await query<RekapKantorRow>(
    `SELECT
       k.oid, k.kantor,
       COUNT(m.laporanid) AS jml_laporan,
       SUM(CASE WHEN m.status_terbuat = '1' THEN 1 ELSE 0 END) AS jml_status_terbuat,
       SUM(CASE WHEN m.foto IS NOT NULL AND m.foto != '' THEN 1 ELSE 0 END) AS jml_foto,
       SUM(CASE WHEN m.foto_pembinaan IS NOT NULL AND m.foto_pembinaan != '' THEN 1 ELSE 0 END) AS jml_foto_pembinaan,
       SUM(CASE WHEN m.raport_ceria IS NOT NULL AND m.raport_ceria != '' THEN 1 ELSE 0 END) AS jml_raport_ceria,
       SUM(CASE WHEN m.raport_satu IS NOT NULL AND m.raport_satu != '' THEN 1 ELSE 0 END) AS jml_raport_satu,
       SUM(CASE WHEN m.raport_dua IS NOT NULL AND m.raport_dua != '' THEN 1 ELSE 0 END) AS jml_raport_dua,
       SUM(CASE WHEN m.surat_suara_hati IS NOT NULL AND m.surat_suara_hati != '' THEN 1 ELSE 0 END) AS jml_surat_suara_hati,
       SUM(CASE WHEN m.dana_saldo_awal IS NOT NULL AND m.dana_saldo_awal <> 0 THEN 1 ELSE 0 END) AS jml_dana_saldo_awal,
       SUM(CASE WHEN m.dana_penerimaan IS NOT NULL AND m.dana_penerimaan <> 0 THEN 1 ELSE 0 END) AS jml_dana_penerimaan,
       SUM(CASE WHEN m.dana_penyaluran IS NOT NULL AND m.dana_penyaluran <> 0 THEN 1 ELSE 0 END) AS jml_dana_penyaluran,
       SUM(CASE WHEN m.s_materi = 'y' THEN 1 ELSE 0 END) AS jml_materi
     FROM ajis_kantor k
     LEFT JOIN manual_laporan m
       ON m.oid = k.oid AND m.semesterid = ? AND m.aktif = 'y' AND m.jenis_laporan = ?
     WHERE ${scope.sql}
       AND (k.kantor LIKE 'IJ%' OR k.kantor LIKE 'SD%' OR k.kantor LIKE 'SM%')
       AND k.oid NOT IN ('09-219', '17-304')
     GROUP BY k.oid, k.kantor
     ORDER BY k.kantor ASC`,
    [semesterid, jenisLaporan, ...scope.params],
  );

  return rows.map(r => ({
    ...r,
    persentase: r.jml_laporan > 0 ? Math.round((r.jml_status_terbuat / r.jml_laporan) * 1000) / 10 : 0,
  }));
}

/** Approve: mark the render done and stamp the file reference (analog of updateManualLaporan). */
export async function approveLapsem(laporanid: string, fileUrl: string): Promise<void> {
  await execute(
    `UPDATE manual_laporan
     SET status_terbuat = '1', tgl_status_terbuat = NOW(), id_program_postgree = ?
     WHERE laporanid = ?`,
    [fileUrl, laporanid],
  );
}

export async function fetchLapsemByLaporanId(laporanid: string): Promise<LapsemRow | null> {
  return queryOne<LapsemRow>(
    `SELECT a.laporanid, a.id_anak, c.nama_lengkap, a.pm_nama_lengkap, a.jns_kel,
            a.oid, a.nama_kantor, a.id_wilayah_pembinaan, a.nama_wilayah,
            a.semesterid, a.nama_semester, a.programid,
            a.donatur_id, a.donatur_nama,
            ROUND(a.dana_saldo_awal, 0) AS dana_saldo_awal_view,
            ROUND(a.dana_penerimaan, 0) AS dana_penerimaan_view,
            ROUND(a.dana_penyaluran, 0) AS dana_penyaluran_view,
            a.status_terbuat, a.jml_materi, a.id_program_postgree, a.tgl_insert
     FROM manual_laporan a
     LEFT JOIN ajis_anak c ON a.id_anak = c.id_anak
     WHERE a.laporanid = ? AND a.aktif = 'y'`,
    [laporanid],
  );
}

interface PemasanganForLapsem {
  id_anak:              string;
  nama_anak:            string;
  id_donatur:           string | null;
  nama_donatur:         string | null;
  id_program:           string | null;
  kantor_id:            string;
  nama_kantor:          string;
  id_wilayah_pembinaan: string | null;
  nama_wilayah:         string | null;
}

/**
 * Generate Lapsem: insert one `manual_laporan` row for `id_anak` + the active
 * semester, if one does not exist yet. Idempotent — returns the existing
 * laporanid untouched when the anak already has a row for that semester,
 * matching legacy's dedup check
 * (`SELECT COUNT(*) FROM manual_laporan WHERE id_pemasangan_baru=? AND semesterid=?`,
 * here keyed by `id_anak` since that is what the action button has in hand).
 */
export async function insertManualLaporan(
  idAnak: string,
  session: SessionData,
): Promise<{ laporanid: string; created: boolean }> {
  const semester = await queryOne<{ semesterid: string; semester: string }>(
    `SELECT semesterid, semester FROM ajis_semester WHERE onprogress = 'y' LIMIT 1`,
  );
  if (!semester) {
    throw new Error('Tidak ada semester aktif (onprogress). Aktifkan semester terlebih dahulu.');
  }

  const existing = await queryOne<{ laporanid: string }>(
    `SELECT laporanid FROM manual_laporan WHERE id_anak = ? AND semesterid = ? AND aktif = 'y'`,
    [idAnak, semester.semesterid],
  );
  if (existing) {
    return { laporanid: existing.laporanid, created: false };
  }

  const pemasangan = await queryOne<PemasanganForLapsem>(
    `SELECT id_anak, nama_anak, id_donatur, nama_donatur, id_program, kantor_id, nama_kantor,
            id_wilayah_pembinaan, nama_wilayah
     FROM ajis_pemasangan
     WHERE id_anak = ? AND status_pasangan = 'y'
     ORDER BY tgl_pemasangan DESC LIMIT 1`,
    [idAnak],
  );
  if (!pemasangan) {
    throw new Error('Anak tidak memiliki pemasangan aktif — tidak dapat generate Lapsem.');
  }

  const anak = await queryOne<{ jns_kel: string; jenjang_pendidikan: string }>(
    `SELECT jns_kel, jenjang_pendidikan FROM ajis_anak WHERE id_anak = ?`,
    [idAnak],
  );

  const laporanid = `LS${semester.semesterid}-${idAnak}`;
  const programid = pemasangan.id_program || '1';

  await execute(
    `INSERT INTO manual_laporan
       (laporanid, id_anak, pm_nama_lengkap, jns_kel, pm_anak_jenjang,
        donatur_id, donatur_nama, programid, semesterid, nama_semester,
        oid, nama_kantor, id_wilayah_pembinaan, nama_wilayah,
        jenis_laporan, aktif, status_terbuat,
        dana_saldo_awal, dana_penerimaan, dana_penyaluran,
        tgl_insert, user_insert)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reguler', 'y', '0', 0, 0, 0, NOW(), ?)`,
    [
      laporanid, idAnak, pemasangan.nama_anak, anak?.jns_kel ?? '', anak?.jenjang_pendidikan ?? '',
      pemasangan.id_donatur ?? '', pemasangan.nama_donatur ?? '', programid,
      semester.semesterid, semester.semester,
      pemasangan.kantor_id, pemasangan.nama_kantor,
      pemasangan.id_wilayah_pembinaan ?? '', pemasangan.nama_wilayah ?? '',
      session.username,
    ],
  );

  return { laporanid, created: true };
}

export { nameToProgram };
