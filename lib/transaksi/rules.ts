/**
 * lib/transaksi/rules.ts — business rules of the Transaksi module.
 *
 * These are the invariants the legacy EasyUI app enforced across ~140 scattered PHP
 * methods. Keeping them in one place is what lets the four legacy save endpoints
 * (c_kantor_ganjil / c_kantor_genap / u_kantor_ganjil / u_kantor_genap) collapse into
 * a single idempotent PUT: the parts that differed between them are all derived here.
 */

import type { Periode, Transaksi } from '@/types/transaksi';

/** Raised for rule violations that must surface to the user as a 400, not a 500. */
export class RuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuleError';
  }
}

/**
 * Semester of a salur month. Legacy picked the endpoint (`_ganjil` vs `_genap`) in the
 * browser from the same month; deriving it server-side removes the chance of a client
 * writing January donations into the genap semester.
 */
export function periode(bulan: number): Periode {
  return bulan <= 6 ? 'ganjil' : 'genap';
}

/**
 * `bulan_salur` is varchar and holds either a number ('7') or a month name ('Juli'),
 * depending on which legacy screen wrote it. Mirrors normalizeBulan() in lib/keuangan.ts.
 */
const BULAN_NAMES = [
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
];

export function parseBulanSalur(raw: string | number | null | undefined): number | null {
  const s = String(raw ?? '').trim().toLowerCase();
  if (!s) return null;

  const n = Number(s);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;

  const idx = BULAN_NAMES.findIndex(m => m === s || m.startsWith(s.slice(0, 3)));
  return idx >= 0 ? idx + 1 : null;
}

/**
 * Pairing key used across pemasangan, penyaluran and laporan semester.
 * Must stay a plain concatenation — other modules rebuild the same string to join on it.
 */
export function idPemasanganBaru(
  idAnak: string,
  idDonatur: string,
  tahun: number | string,
): string {
  return `${idAnak}${idDonatur}${tahun}`;
}

/**
 * The module's central invariant: a transaction may only be split into amounts that
 * add up to exactly what was donated.
 *
 * Compared as rounded integers because `perkiraan_rp` is double(20,2) while
 * `ajis_input_donasi.nominal_donasi` is a plain double — a strict === on the raw
 * floats rejects legitimate entries over a stray 0.000001.
 */
export function assertTotalMatches(
  rows: { nominal_donasi: number }[],
  perkiraanRp: number,
): void {
  const total = rows.reduce((sum, r) => sum + Number(r.nominal_donasi || 0), 0);
  if (Math.round(total) !== Math.round(perkiraanRp)) {
    throw new RuleError(
      `Nominal tidak sesuai: total entry ${Math.round(total).toLocaleString('id-ID')} ` +
      `vs nominal transaksi ${Math.round(perkiraanRp).toLocaleString('id-ID')}. ` +
      `Silakan koreksi ulang.`,
    );
  }
}

/**
 * A transaction may only be entered fresh when it has not been entered before and has
 * not been explicitly rejected for salur. Already-entered rows must go through Update
 * Cashflow so the operator sees what is being replaced.
 */
export function canEntry(t: Pick<Transaksi, 'status_pasang' | 'approve_salur'>): boolean {
  return t.status_pasang !== 'y' && t.approve_salur !== 'n';
}

/** Guard for POST-as-create; Update Cashflow (mode 'update') bypasses it deliberately. */
export function assertCanEntry(t: Pick<Transaksi, 'status_pasang' | 'approve_salur'>): void {
  if (t.status_pasang === 'y') {
    throw new RuleError('Transaksi sudah dientry. Silakan gunakan Update Cashflow.');
  }
  if (t.approve_salur === 'n') {
    throw new RuleError('Transaksi belum disetujui untuk disalurkan (approve salur = n).');
  }
}

/**
 * Salur period must be set before the money can be split, because `periode`, `bulan`
 * and `tahun` on every `ajis_input_donasi` row are copied from it.
 */
export function assertSalurPeriodSet(t: Pick<Transaksi, 'bulan_salur' | 'tahun_salur'>): number {
  const bulan = parseBulanSalur(t.bulan_salur);
  if (!bulan || !String(t.tahun_salur ?? '').trim()) {
    throw new RuleError(
      'Bulan/tahun salur belum ditentukan. Jalankan Approve Salur terlebih dahulu.',
    );
  }
  return bulan;
}
