/**
 * lib/userPg/fields.ts — column map for `ajis_user` (Postgres), shared by the
 * GET/POST/PUT handlers so the writable-column whitelist and its
 * camelCase→snake_case mapping live in exactly one place. Mirrors
 * lib/anakPg/fields.ts.
 *
 * Raw SQL only (CLAUDE.md §2.1) — this is a plain data map, no drizzle import.
 */
import type { AjisUserPg, AjisUserPgInput } from '@/types/user-pg';

/** [camelCase field on AjisUserPgInput, snake_case column in ajis_user]. Excludes
 *  the surrogate `idUser` (never writable) and the joined `groupUser` (not a
 *  column on ajis_user itself — it lives on ajis_group_user). */
export const USER_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof AjisUserPgInput, string]> = [
  ['username', 'username'],
  ['email', 'email'],
  ['nik', 'nik'],
  ['kantorId', 'kantor_id'],
  ['namaKantor', 'nama_kantor'],
  ['idWilayahPembinaan', 'id_wilayah_pembinaan'],
  ['namaWilayah', 'nama_wilayah'],
  ['idGroupUser', 'id_group_user'],
  ['aktif', 'aktif'],
];

/** Every SELECT column, snake_case, in `u.col` form, plus the joined role name. */
export const USER_DETAIL_COLUMNS = [
  'u.id_user',
  ...USER_WRITABLE_FIELDS.map(([, col]) => `u.${col}`),
  'u.user_insert',
  'u.date_insert',
  'g.group_user',
].join(', ');

/** Row shape as returned by USER_DETAIL_COLUMNS — snake_case keys. */
export type UserPgRow = Record<string, unknown>;

/** snake_case DB row → camelCase AjisUserPg-shaped object. */
export function rowToUserPg(row: UserPgRow): AjisUserPg {
  const out: Record<string, unknown> = { idUser: row.id_user };
  for (const [field, col] of USER_WRITABLE_FIELDS) {
    out[field as string] = row[col];
  }
  out.groupUser = row.group_user ?? null;
  out.userInsert = row.user_insert ?? null;
  out.dateInsert = row.date_insert ?? null;
  return out as unknown as AjisUserPg;
}

interface BuildResult {
  columns: string[];
  placeholders: string[];
  values: unknown[];
}

/**
 * Builds the writable column/value lists for an INSERT or UPDATE from a partial
 * body, starting placeholders at `$startIndex`. Unknown keys on the body are
 * silently ignored (not part of USER_WRITABLE_FIELDS) rather than erroring.
 */
export function buildWritable(body: AjisUserPgInput, startIndex: number): BuildResult {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const [field, col] of USER_WRITABLE_FIELDS) {
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
