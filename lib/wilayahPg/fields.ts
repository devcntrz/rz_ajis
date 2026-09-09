/**
 * lib/wilayahPg/fields.ts — column map for `ajis_wilayah_pembinaan` (Postgres),
 * shared by the GET/POST/PUT handlers so the writable-column whitelist and its
 * camelCase→snake_case mapping live in exactly one place. Mirrors
 * lib/kantorPg/fields.ts and lib/surveyPg/fields.ts.
 *
 * Raw SQL only (CLAUDE.md §2.1) — this is a plain data map, no drizzle import.
 */
import type { AjisWilayahPg, AjisWilayahPgInput } from '@/types/wilayah-pg';

/** [camelCase field on AjisWilayahPgInput, snake_case column in
 *  ajis_wilayah_pembinaan]. Excludes the surrogate `idWilayahPembinaan` (never
 *  writable). Includes `namaWilayah` — required on create, otherwise a normal
 *  writable column on update. */
export const WILAYAH_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof AjisWilayahPgInput, string]> = [
  ['namaWilayah', 'nama_wilayah'],
  ['alamatWilayah', 'alamat_wilayah'],
  ['kantorId', 'kantor_id'],
  ['namaKantor', 'nama_kantor'],
  ['statusApprove', 'status_approve'],
  ['propid', 'propid'],
  ['namaPropinsi', 'nama_propinsi'],
  ['kabid', 'kabid'],
  ['namaKabupaten', 'nama_kabupaten'],
  ['camatid', 'camatid'],
  ['namaKecamatan', 'nama_kecamatan'],
  ['desaid', 'desaid'],
  ['namaDesa', 'nama_desa'],
  ['aktif', 'aktif'],
];

/** Every SELECT column, snake_case, in `w.col` form — full detail view. */
export const WILAYAH_DETAIL_COLUMNS = [
  'w.id_wilayah_pembinaan',
  ...WILAYAH_WRITABLE_FIELDS.map(([, col]) => `w.${col}`),
].join(', ');

/** Row shape as returned by WILAYAH_DETAIL_COLUMNS — snake_case keys. */
export type WilayahPgRow = Record<string, unknown>;

/** snake_case DB row → camelCase AjisWilayahPg-shaped object. */
export function rowToWilayahPg(row: WilayahPgRow): AjisWilayahPg {
  const out: Record<string, unknown> = { idWilayahPembinaan: row.id_wilayah_pembinaan };
  for (const [field, col] of WILAYAH_WRITABLE_FIELDS) {
    out[field as string] = row[col];
  }
  return out as unknown as AjisWilayahPg;
}

interface BuildResult {
  columns: string[];
  placeholders: string[];
  values: unknown[];
}

/**
 * Builds the writable column/value lists for an INSERT or UPDATE from a partial
 * body, starting placeholders at `$startIndex`. Unknown keys on the body are
 * silently ignored (not part of WILAYAH_WRITABLE_FIELDS) rather than erroring.
 */
export function buildWritable(body: AjisWilayahPgInput, startIndex: number): BuildResult {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const [field, col] of WILAYAH_WRITABLE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    columns.push(col);
    values.push((body as Record<string, unknown>)[field as string] ?? null);
  }
  const placeholders = columns.map((_, idx) => `$${startIndex + idx}`);
  return { columns, placeholders, values };
}

/** True for a Postgres unique_violation error (SQLSTATE 23505) — used to turn a
 *  duplicate `nama_wilayah` insert/update into a 409 DUPLICATE_NAMA_WILAYAH
 *  response. */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err
    && (err as { code?: string }).code === '23505';
}
