/**
 * GET /api/anakjuara/anak-juara/export
 * Excel export of Anak Juara (full columns), same filters as list (no pagination).
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';
import { fmtTgl } from '@/lib/utils';
import {
  buildKeuangan,
  pivotByPairing,
  type BulanAgg,
  type OpnameAgg,
  type KeuanganPivot,
  type SemesterBlock,
} from '@/lib/keuangan';

// Building a large xlsx (base rows + Jan-Des finance pivot) can exceed the default
// serverless timeout.
export const maxDuration = 60;

/**
 * Mirrors components/anak-juara/AnakJuaraTable.tsx column-for-column (minus the
 * non-data '#' and 'Aksi' columns) so the export matches what the grid shows.
 */
function semesterColumns(semester: 'ganjil' | 'genap'): ExcelColumn[] {
  const suffix = semester === 'ganjil' ? 'Jan – Jun' : 'Jul – Des';
  const months = semester === 'ganjil'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']
    : ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return [
    { key: `saldo_awal_${semester}`, header: `Saldo Awal ${suffix}` },
    ...months.map((m, i) => ({ key: `donasi_${semester}_${i}`, header: `Donasi ${m}` })),
    { key: `jml_donasi_${semester}`, header: `Σ Donasi ${suffix}` },
    { key: `saldo_plus_donasi_${semester}`, header: `Σ Saldo + Donasi ${suffix}` },
    ...months.map((m, i) => ({ key: `penyaluran_${semester}_${i}`, header: `Penyaluran ${m}` })),
    { key: `jml_tersalurkan_${semester}`, header: `Σ Tersalurkan ${suffix}` },
    { key: `saldo_akhir_${semester}`, header: `Saldo Akhir ${suffix}` },
    { key: `aktif_${semester}`, header: `Aktif ${suffix}` },
    { key: `wajib_${semester}`, header: `Wajib ${suffix}` },
  ];
}

const COLUMNS: ExcelColumn[] = [
  { key: 'id_anak', header: 'ID Anak' },
  { key: 'nama_anak', header: 'Nama Anak' },
  { key: 'jenjang_pendidikan', header: 'Jenjang' },
  { key: 'kelas', header: 'Kelas' },
  { key: 'status_label', header: 'Status' },
  { key: 'nama_donatur', header: 'Donatur' },
  { key: 'id_donatur', header: 'ID Donatur' },
  { key: 'program_donasi', header: 'Program' },
  { key: 'nama_rfo', header: 'Funding' },
  { key: 'nia_rfo', header: 'ID Zisco' },
  { key: 'nama_kantor', header: 'Kantor' },
  { key: 'nama_wilayah', header: 'Wilayah' },
  { key: 'tgl_pasang', header: 'Tgl Pasang' },
  ...semesterColumns('ganjil'),
  ...semesterColumns('genap'),
  { key: 'date_generated', header: 'Date Generated' },
  { key: 'user_generated', header: 'User Generated' },
];

const EXPORT_LIMIT = 20_000;
/** Keeps each keuangan chunk's IN() list bounded, same rationale as the grid's keuangan route. */
const KEUANGAN_CHUNK = 500;

function flattenSemester(semester: 'ganjil' | 'genap', block: SemesterBlock): Record<string, unknown> {
  const out: Record<string, unknown> = {
    [`saldo_awal_${semester}`]: block.saldo_awal,
    [`jml_donasi_${semester}`]: block.jml_donasi,
    [`saldo_plus_donasi_${semester}`]: block.saldo_plus_donasi,
    [`jml_tersalurkan_${semester}`]: block.jml_tersalurkan,
    [`saldo_akhir_${semester}`]: block.saldo_akhir,
    [`aktif_${semester}`]: block.aktif,
    [`wajib_${semester}`]: block.wajib,
  };
  block.donasi.forEach((c, i) => { out[`donasi_${semester}_${i}`] = c.total; });
  block.penyaluran.forEach((c, i) => { out[`penyaluran_${semester}_${i}`] = c.total; });
  return out;
}

/** Batch-builds the same Jan-Des finance pivot as the grid's keuangan route, chunked. */
async function buildKeuanganMap(ids: string[]): Promise<Record<string, KeuanganPivot>> {
  const donasiRows: BulanAgg[] = [];
  const penyaluranRows: BulanAgg[] = [];
  const opnameRows: OpnameAgg[] = [];
  const hargaRows: Array<{ id_pemasangan_baru: string; harga_program: number }> = [];

  for (let i = 0; i < ids.length; i += KEUANGAN_CHUNK) {
    const chunk = ids.slice(i, i + KEUANGAN_CHUNK);
    const ph = chunk.map(() => '?').join(',');
    const [d, p, o, h] = await Promise.all([
      query<BulanAgg>(
        `SELECT id_pemasangan_baru, bulan, SUM(IFNULL(nominal_donasi, 0)) AS total
         FROM ajis_input_donasi
         WHERE id_pemasangan_baru IN (${ph}) AND jenis = 'trans'
         GROUP BY id_pemasangan_baru, bulan`,
        chunk,
      ),
      query<BulanAgg>(
        `SELECT id_pemasangan_baru, bulan, SUM(IFNULL(nominal_penyaluran, 0)) AS total
         FROM ajis_penyaluran
         WHERE id_pemasangan_baru IN (${ph})
         GROUP BY id_pemasangan_baru, bulan`,
        chunk,
      ),
      query<OpnameAgg>(
        `SELECT id_pemasangan_baru,
                saldo_awal_ganjil, saldo_akhir_ganjil, saldo_awal_genap, saldo_akhir_genap,
                date_opname_ganjil, user_opname_ganjil, date_opname_genap, user_opname_genap
         FROM ajis_opname
         WHERE id_pemasangan_baru IN (${ph})`,
        chunk,
      ),
      query<{ id_pemasangan_baru: string; harga_program: number }>(
        `SELECT id_pemasangan_baru, harga_program
         FROM ajis_pemasangan
         WHERE id_pemasangan_baru IN (${ph})`,
        chunk,
      ),
    ]);
    donasiRows.push(...d);
    penyaluranRows.push(...p);
    opnameRows.push(...o);
    hargaRows.push(...h);
  }

  const donasi = pivotByPairing(donasiRows);
  const penyaluran = pivotByPairing(penyaluranRows);
  const opname = new Map(opnameRows.map(o => [String(o.id_pemasangan_baru), o]));
  const harga = new Map(hargaRows.map(h => [String(h.id_pemasangan_baru), Number(h.harga_program) || 0]));

  const data: Record<string, KeuanganPivot> = {};
  for (const id of ids) {
    data[id] = buildKeuangan(donasi[id], penyaluran[id], opname.get(id), harga.get(id) ?? 0);
  }
  return data;
}

/**
 * `nama_donatur` on `ajis_pemasangan` is a denormalized per-row copy and is blank
 * on some rows even though `id_donatur` is correct (same quirk documented in
 * app/api/anakjuara/anak-juara/route.ts). Backfill from any sibling row sharing
 * the same `id_donatur` that does have a name, so the export doesn't show blanks
 * the grid's search already knows how to work around.
 */
async function buildDonaturFallback(rows: Record<string, unknown>[]): Promise<Map<string, string>> {
  const missingIds = Array.from(new Set(
    rows
      .filter(r => !r.nama_donatur && r.id_donatur)
      .map(r => String(r.id_donatur)),
  ));
  if (missingIds.length === 0) return new Map();

  const map = new Map<string, string>();
  for (let i = 0; i < missingIds.length; i += KEUANGAN_CHUNK) {
    const chunk = missingIds.slice(i, i + KEUANGAN_CHUNK);
    const ph = chunk.map(() => '?').join(',');
    const found = await query<{ id_donatur: string; nama_donatur: string }>(
      `SELECT DISTINCT id_donatur, nama_donatur
       FROM ajis_pemasangan
       WHERE id_donatur IN (${ph}) AND nama_donatur != ''`,
      chunk,
    );
    for (const f of found) {
      if (!map.has(String(f.id_donatur))) map.set(String(f.id_donatur), f.nama_donatur);
    }
  }
  return map;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const currentYear = String(new Date().getFullYear());
    const tahun = sp.get('tahun') || currentYear;
    const wilayah = sp.get('wilayah') || '';
    const statusPasangan = sp.get('status_pasangan') || '';
    const q = sp.get('q') || '';

    const { sql: scopeSql, params: scopeParams, forcedKantor } = getKantorScope(
      session,
      'kantor_id',
      'p',
    );

    const conditions: string[] = [scopeSql, 'p.tahun = ?'];
    const params: unknown[] = [...scopeParams, tahun];

    const kantorParam = sp.get('kantor_id') || '';
    if (!forcedKantor && kantorParam) {
      conditions.push('p.kantor_id = ?');
      params.push(kantorParam);
    }
    if (wilayah) {
      conditions.push('p.id_wilayah_pembinaan = ?');
      params.push(wilayah);
    }
    if (statusPasangan === 'y' || statusPasangan === 'n') {
      conditions.push('p.status_pasangan = ?');
      params.push(statusPasangan);
    }
    if (q) {
      conditions.push(`(
        p.nama_anak LIKE ? OR p.id_anak LIKE ? OR
        p.nama_donatur LIKE ? OR p.id_donatur LIKE ? OR
        p.nama_kantor LIKE ? OR p.nama_wilayah LIKE ? OR
        p.nia_rfo LIKE ? OR p.nama_rfo LIKE ? OR
        p.id_pemasangan_baru LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like, like, like);
    }

    const WHERE = conditions.join(' AND ');

    const rows = await query<Record<string, unknown>>(
      `SELECT
         p.id_pemasangan_baru,
         p.id_anak,
         p.nama_anak,
         p.id_donatur,
         p.nama_donatur,
         p.program_donasi,
         p.nama_kantor,
         p.nama_wilayah,
         p.status_pasangan,
         p.tgl_pemasangan,
         p.nia_rfo,
         p.nama_rfo,
         p.jenjang_pendidikan,
         p.kelas
       FROM ajis_pemasangan p
       WHERE ${WHERE}
       ORDER BY p.nama_anak ASC
       LIMIT ?`,
      [...params, EXPORT_LIMIT],
    );

    const ids = rows.map(r => String(r.id_pemasangan_baru));
    const keuangan = await buildKeuanganMap(ids);
    const donaturFallback = await buildDonaturFallback(rows);

    const exportRows = rows.map(r => {
      const k = keuangan[String(r.id_pemasangan_baru)];
      const namaDonatur = (r.nama_donatur as string | null) || donaturFallback.get(String(r.id_donatur)) || r.nama_donatur;
      return {
        id_anak: r.id_anak,
        nama_anak: r.nama_anak,
        jenjang_pendidikan: r.jenjang_pendidikan,
        kelas: r.kelas,
        status_label: r.status_pasangan === 'y' ? 'Aktif' : 'Nonaktif',
        nama_donatur: namaDonatur,
        id_donatur: r.id_donatur,
        program_donasi: r.program_donasi,
        nama_rfo: r.nama_rfo,
        nia_rfo: r.nia_rfo,
        nama_kantor: r.nama_kantor,
        nama_wilayah: r.nama_wilayah,
        tgl_pasang: fmtTgl(r.tgl_pemasangan as string | null),
        ...flattenSemester('ganjil', k.ganjil),
        ...flattenSemester('genap', k.genap),
        date_generated: fmtTgl(k.date_generated),
        user_generated: k.user_generated || '—',
      };
    });

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `anak-juara-${tahun}-${stamp}.xlsx`,
      'Anak Juara',
      COLUMNS,
      exportRows,
    );
  } catch (err) {
    console.error('[anak-juara export]', err);
    return NextResponse.json({ error: 'Gagal export Anak Juara.' }, { status: 500 });
  }
}
