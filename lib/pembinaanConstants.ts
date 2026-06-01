/** Jenis pembinaan — shared by filter, form, and validation. */
export const JENIS_PEMBINAAN_OPTIONS = [
  'Pembinaan Reguler',
  'Edukasi Pekanan',
  'P3A',
  'Parenting',
] as const;

export type JenisPembinaan = (typeof JENIS_PEMBINAAN_OPTIONS)[number];

export const DEFAULT_JENIS_PEMBINAAN: JenisPembinaan = 'Pembinaan Reguler';

export const ORTU_HADIR_OPTIONS = [
  { value: 'ayah', label: 'Ayah' },
  { value: 'ibu',  label: 'Ibu' },
  { value: 'wali', label: 'Wali' },
] as const;

export type OrtuHadir = (typeof ORTU_HADIR_OPTIONS)[number]['value'];

export function isParenting(jenis: string): boolean {
  return jenis === 'Parenting';
}

/** Month/year from date — matches legacy DB (bulan without leading zero). */
export function bulanTahunFromDate(tgl: string): { bulan: string; tahun: string } {
  const d = new Date(tgl);
  return {
    bulan: String(d.getMonth() + 1),
    tahun: String(d.getFullYear()),
  };
}

export function p3aValue(jenis: string, p3aInput: string): string {
  return jenis === 'P3A' ? p3aInput.trim() : '';
}
