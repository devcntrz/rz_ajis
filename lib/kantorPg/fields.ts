/**
 * lib/kantorPg/fields.ts — column map for `ajis_kantor` (Postgres), shared by the
 * GET/POST/PUT handlers so the writable-column whitelist and its
 * camelCase→snake_case mapping live in exactly one place. Mirrors
 * lib/anakPg/fields.ts and lib/userPg/fields.ts.
 *
 * Raw SQL only (CLAUDE.md §2.1) — this is a plain data map, no drizzle import.
 */
import type { AjisKantorPg, AjisKantorPgInput } from '@/types/kantor-pg';

/** [camelCase field on AjisKantorPgInput, snake_case column in ajis_kantor].
 *  Excludes the surrogate `id` (never writable) and `oid` (handled separately —
 *  required on create, immutable on update since every other table's FK points
 *  at it, mirroring how idAnak is treated in lib/anakPg/fields.ts). */
export const KANTOR_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof AjisKantorPgInput, string]> = [
  ['kantor', 'kantor'],
  ['alamat', 'alamat'],
  ['noTelp', 'no_telp'],
  ['oidParent', 'oid_parent'],
  ['oidParentSecond', 'oid_parent_second'],
  ['jenis', 'jenis'],
];

/** Every SELECT column, snake_case, in `k.col` form — full detail view. */
export const KANTOR_DETAIL_COLUMNS = [
  'k.id', 'k.oid',
  ...KANTOR_WRITABLE_FIELDS.map(([, col]) => `k.${col}`),
  'k.external_ids',
].join(', ');

/** Row shape as returned by KANTOR_DETAIL_COLUMNS — snake_case keys. */
export type KantorPgRow = Record<string, unknown>;

/** snake_case DB row → camelCase AjisKantorPg-shaped object. */
export function rowToKantorPg(row: KantorPgRow): AjisKantorPg {
  const out: Record<string, unknown> = { id: row.id, oid: row.oid };
  for (const [field, col] of KANTOR_WRITABLE_FIELDS) {
    out[field as string] = row[col];
  }
  out.externalIds = row.external_ids ?? null;
  return out as unknown as AjisKantorPg;
}

interface BuildResult {
  columns: string[];
  placeholders: string[];
  values: unknown[];
}

/**
 * Builds the writable column/value lists for an INSERT or UPDATE from a partial
 * body, starting placeholders at `$startIndex`. Unknown keys on the body are
 * silently ignored (not part of KANTOR_WRITABLE_FIELDS) rather than erroring.
 */
export function buildWritable(body: AjisKantorPgInput, startIndex: number): BuildResult {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const [field, col] of KANTOR_WRITABLE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    columns.push(col);
    values.push((body as Record<string, unknown>)[field as string] ?? null);
  }
  const placeholders = columns.map((_, idx) => `$${startIndex + idx}`);
  return { columns, placeholders, values };
}

/** True for a Postgres unique_violation error (SQLSTATE 23505) — used to turn a
 *  duplicate `oid` insert/update into a 409 DUPLICATE_OID response. */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err
    && (err as { code?: string }).code === '23505';
}
