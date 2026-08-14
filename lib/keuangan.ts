/**
 * lib/keuangan.ts — semester finance pivot, shared by the Anak Juara grid and the
 * Ganti Anak eksekusi modal so both always show identical figures.
 *
 * Replaces the nested MySQL views (ajis_view_anak_juara ← ajis_view_donasi /
 * ajis_view_penyaluran / ajis_opname). The formulas mirror that view exactly:
 * aggregates are keyed on id_pemasangan_baru alone (no year predicate — the legacy
 * views group by id_pemasangan_baru only), donations are restricted to jenis='trans',
 * and the aktif/wajib CASE expressions are reproduced verbatim.
 */

export const BULAN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

export const BULAN_LABEL: Record<string, string> = {
  '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mei', '6': 'Jun',
  '7': 'Jul', '8': 'Agu', '9': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
};

export const GANJIL_KEYS = ['1', '2', '3', '4', '5', '6'] as const;
export const GENAP_KEYS = ['7', '8', '9', '10', '11', '12'] as const;

/**
 * `bulan` is varchar in both source tables and holds either a number or a month name.
 * The legacy view compares it numerically (`bulan = 1`), which silently drops any
 * name-valued row; accepting both keeps those rows counted.
 */
export function normalizeBulan(b: string): string {
  const n = Number(b);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return String(n);
  const map: Record<string, string> = {
    januari: '1', january: '1', february: '2', februari: '2', maret: '3', march: '3',
    april: '4', mei: '5', may: '5', juni: '6', june: '6',
    juli: '7', july: '7', agustus: '8', august: '8',
    september: '9', oktober: '10', october: '10',
    november: '11', desember: '12', december: '12',
  };
  return map[String(b).toLowerCase().trim()] || '';
}

export interface MonthCell {
  bulan: string;
  label: string;
  total: number;
}

export interface SemesterBlock {
  saldo_awal: number;
  donasi: MonthCell[];
  jml_donasi: number;
  saldo_plus_donasi: number;
  penyaluran: MonthCell[];
  jml_tersalurkan: number;
  saldo_akhir: number;
  aktif: string;
  wajib: string;
}

export interface KeuanganPivot {
  ganjil: SemesterBlock;
  genap: SemesterBlock;
  date_generated: string | null;
  user_generated: string | null;
}

/** Raw aggregate row: one (id_pemasangan_baru, bulan) bucket. */
export interface BulanAgg {
  id_pemasangan_baru: string;
  bulan: string;
  total: number | string;
}

export interface OpnameAgg {
  id_pemasangan_baru: string;
  saldo_awal_ganjil: number;
  saldo_akhir_ganjil: number;
  saldo_awal_genap: number;
  saldo_akhir_genap: number;
  date_opname_ganjil?: string | null;
  user_opname_ganjil?: string | null;
  date_opname_genap?: string | null;
  user_opname_genap?: string | null;
}

function emptyPivot(): Record<string, number> {
  const p: Record<string, number> = {};
  for (const k of BULAN_KEYS) p[k] = 0;
  return p;
}

/** Group month aggregates into { id_pemasangan_baru: { '1'..'12': total } }. */
export function pivotByPairing(rows: BulanAgg[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const key = normalizeBulan(String(r.bulan));
    if (!key) continue;
    const id = String(r.id_pemasangan_baru);
    if (!out[id]) out[id] = emptyPivot();
    out[id][key] += Number(r.total) || 0;
  }
  return out;
}

// Mirrors ajis_view_anak_juara aktif_ganjil / aktif_genap.
function aktifOf(saldoAkhir: number, hargaProgram: number): string {
  return saldoAkhir < hargaProgram ? 'Stop' : 'Aktif';
}

// Mirrors ajis_view_anak_juara wajib_ganjil / wajib_genap.
function wajibOf(masuk: number, keluar: number): string {
  if (masuk > 0 && keluar > 0) return 'Wajib Lapsem';
  if (masuk === 0 && keluar === 0) return '';
  return 'Koq Bisa?';
}

function buildSemester(
  keys: readonly string[],
  donasi: Record<string, number>,
  penyaluran: Record<string, number>,
  saldoAwal: number,
  hargaProgram: number,
): SemesterBlock {
  const jmlDonasi = keys.reduce((a, k) => a + (donasi[k] || 0), 0);
  const jmlSalur = keys.reduce((a, k) => a + (penyaluran[k] || 0), 0);
  const saldoPlus = jmlDonasi + saldoAwal;
  const saldoAkhir = saldoPlus - jmlSalur;
  return {
    saldo_awal: saldoAwal,
    donasi: keys.map(k => ({ bulan: k, label: BULAN_LABEL[k], total: donasi[k] || 0 })),
    jml_donasi: jmlDonasi,
    saldo_plus_donasi: saldoPlus,
    penyaluran: keys.map(k => ({ bulan: k, label: BULAN_LABEL[k], total: penyaluran[k] || 0 })),
    jml_tersalurkan: jmlSalur,
    saldo_akhir: saldoAkhir,
    aktif: aktifOf(saldoAkhir, hargaProgram),
    wajib: wajibOf(saldoPlus, jmlSalur),
  };
}

export function buildKeuangan(
  donasi: Record<string, number> | undefined,
  penyaluran: Record<string, number> | undefined,
  opname: OpnameAgg | null | undefined,
  hargaProgram: number,
): KeuanganPivot {
  const d = donasi ?? emptyPivot();
  const p = penyaluran ?? emptyPivot();
  return {
    ganjil: buildSemester(GANJIL_KEYS, d, p, Number(opname?.saldo_awal_ganjil ?? 0), hargaProgram),
    genap: buildSemester(GENAP_KEYS, d, p, Number(opname?.saldo_awal_genap ?? 0), hargaProgram),
    date_generated: opname?.date_opname_genap ?? opname?.date_opname_ganjil ?? null,
    user_generated: opname?.user_opname_genap || opname?.user_opname_ganjil || null,
  };
}
