/**
 * lib/refPg/fields.ts — writable-column whitelists and row-mappers for the
 * four administrative reference tables (ref_propinsi, ref_kabupaten,
 * ref_kecamatan, ref_desa), mirroring lib/wilayahPg/fields.ts.
 *
 * Raw SQL only (CLAUDE.md §2.1) — plain data maps, no drizzle import.
 */
import type {
  RefPropinsiPg, RefPropinsiPgInput,
  RefKabupatenPg, RefKabupatenPgInput,
  RefKecamatanPg, RefKecamatanPgInput,
  RefDesaPg, RefDesaPgInput,
} from '@/types/ref-pg';

interface BuildResult {
  columns: string[];
  placeholders: string[];
  values: unknown[];
}

/** Generic writable-column/value builder for an INSERT or UPDATE, shared by
 *  all four tables. Placeholders start at `$startIndex`. Unknown keys on the
 *  body are silently ignored rather than erroring. */
function buildWritableGeneric<TInput extends Record<string, unknown>>(
  fields: ReadonlyArray<readonly [keyof TInput, string]>,
  body: TInput,
  startIndex: number,
): BuildResult {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const [field, col] of fields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    columns.push(col);
    values.push((body as Record<string, unknown>)[field as string] ?? null);
  }
  const placeholders = columns.map((_, idx) => `$${startIndex + idx}`);
  return { columns, placeholders, values };
}

/** True for a Postgres unique_violation error (SQLSTATE 23505). */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err
    && (err as { code?: string }).code === '23505';
}

/** True for a Postgres foreign_key_violation error (SQLSTATE 23503) — the
 *  parent-code lookups in the POST handlers should normally catch a missing
 *  parent before this fires, but it's a useful backstop. */
export function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err
    && (err as { code?: string }).code === '23503';
}

/* ---------------------------------------------------------------------- */
/* Propinsi                                                                */
/* ---------------------------------------------------------------------- */

export const PROPINSI_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof RefPropinsiPgInput, string]> = [
  ['propid', 'propid'],
  ['propinsi', 'propinsi'],
  ['ibukota', 'ibukota'],
  ['aktif', 'aktif'],
];

export const PROPINSI_DETAIL_COLUMNS = ['p.id', ...PROPINSI_WRITABLE_FIELDS.map(([, col]) => `p.${col}`)].join(', ');

export function rowToPropinsiPg(row: Record<string, unknown>): RefPropinsiPg {
  return {
    id: row.id as number,
    propid: row.propid as string,
    propinsi: row.propinsi as string,
    ibukota: row.ibukota as string | null,
    aktif: row.aktif as boolean,
  };
}

export function buildPropinsiWritable(body: RefPropinsiPgInput, startIndex: number): BuildResult {
  return buildWritableGeneric(PROPINSI_WRITABLE_FIELDS, body, startIndex);
}

/* ---------------------------------------------------------------------- */
/* Kabupaten                                                               */
/* ---------------------------------------------------------------------- */

/** Excludes `kabid` (server-generated, immutable) — callers add it
 *  separately on INSERT and never on UPDATE. */
export const KABUPATEN_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof RefKabupatenPgInput, string]> = [
  ['propid', 'propid'],
  ['kabupaten', 'kabupaten'],
  ['kota', 'kota'],
  ['ibukota', 'ibukota'],
  ['aktif', 'aktif'],
];

export const KABUPATEN_DETAIL_COLUMNS = [
  'k.id', 'k.kabid',
  ...KABUPATEN_WRITABLE_FIELDS.map(([, col]) => `k.${col}`),
  'p.propinsi AS nama_propinsi',
].join(', ');

export function rowToKabupatenPg(row: Record<string, unknown>): RefKabupatenPg {
  return {
    id: row.id as number,
    kabid: row.kabid as string,
    propid: row.propid as string,
    namaPropinsi: (row.nama_propinsi as string | null) ?? null,
    kabupaten: row.kabupaten as string,
    kota: row.kota as boolean,
    ibukota: row.ibukota as string | null,
    aktif: row.aktif as boolean,
  };
}

export function buildKabupatenWritable(body: RefKabupatenPgInput, startIndex: number): BuildResult {
  return buildWritableGeneric(KABUPATEN_WRITABLE_FIELDS, body, startIndex);
}

/* ---------------------------------------------------------------------- */
/* Kecamatan                                                               */
/* ---------------------------------------------------------------------- */

/** Excludes `camatid` (server-generated, immutable). */
export const KECAMATAN_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof RefKecamatanPgInput, string]> = [
  ['kabid', 'kabid'],
  ['namaKecamatan', 'nama_kecamatan'],
  ['kodepos', 'kodepos'],
  ['aktif', 'aktif'],
];

export const KECAMATAN_DETAIL_COLUMNS = [
  'c.id', 'c.camatid',
  ...KECAMATAN_WRITABLE_FIELDS.map(([, col]) => `c.${col}`),
  'k.kabupaten AS nama_kabupaten',
].join(', ');

export function rowToKecamatanPg(row: Record<string, unknown>): RefKecamatanPg {
  return {
    id: row.id as number,
    camatid: row.camatid as string,
    namaKecamatan: row.nama_kecamatan as string,
    kodepos: row.kodepos as string | null,
    kabid: row.kabid as string,
    namaKabupaten: (row.nama_kabupaten as string | null) ?? null,
    aktif: row.aktif as boolean,
  };
}

export function buildKecamatanWritable(body: RefKecamatanPgInput, startIndex: number): BuildResult {
  return buildWritableGeneric(KECAMATAN_WRITABLE_FIELDS, body, startIndex);
}

/* ---------------------------------------------------------------------- */
/* Desa / Kelurahan                                                        */
/* ---------------------------------------------------------------------- */

/** Excludes `desaid` (server-generated, immutable). */
export const DESA_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof RefDesaPgInput, string]> = [
  ['camatid', 'camatid'],
  ['namaDesa', 'nama_desa'],
  ['kelurahan', 'kelurahan'],
  ['propid', 'propid'],
  ['kabid', 'kabid'],
  ['nomorIndukDesa', 'nomor_induk_desa'],
  ['aktif', 'aktif'],
];

export const DESA_DETAIL_COLUMNS = [
  'd.id', 'd.desaid',
  ...DESA_WRITABLE_FIELDS.map(([, col]) => `d.${col}`),
  'c.nama_kecamatan AS nama_kecamatan',
].join(', ');

export function rowToDesaPg(row: Record<string, unknown>): RefDesaPg {
  return {
    id: row.id as number,
    desaid: row.desaid as string,
    namaDesa: row.nama_desa as string,
    kelurahan: row.kelurahan as boolean,
    camatid: row.camatid as string,
    namaKecamatan: (row.nama_kecamatan as string | null) ?? null,
    propid: row.propid as string | null,
    kabid: row.kabid as string | null,
    nomorIndukDesa: row.nomor_induk_desa as string | null,
    aktif: row.aktif as boolean,
  };
}

export function buildDesaWritable(body: RefDesaPgInput, startIndex: number): BuildResult {
  return buildWritableGeneric(DESA_WRITABLE_FIELDS, body, startIndex);
}
