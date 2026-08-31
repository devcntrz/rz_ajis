/**
 * db/schema/_shared.ts — column helpers shared by every table file.
 *
 * MIGRATION INPUT ONLY. Nothing under app/ or lib/ may import this (PRD §2.1 rule 1);
 * eslint enforces it.
 */
import { sql, type SQL } from 'drizzle-orm';
import { check, jsonb, numeric, timestamp, varchar, bigint } from 'drizzle-orm/pg-core';

/** Money. Always numeric, never double precision (PRD §2.1 rule 6). */
export const money = (name: string) =>
  numeric(name, { precision: 20, scale: 2 });

/** Coordinates: legacy float(10,6) → numeric(10,6) (§6.1). */
export const coord = (name: string) => numeric(name, { precision: 10, scale: 6 });

/**
 * One jsonb bag per table replacing the ~40 scattered `*_postgree` / `*_erpwh` /
 * `id_ijgs_*` / `oid_rz` / `upload_gdrive` columns (§6.1).
 */
export const externalIds = () => jsonb('external_ids');

/** Unified office key across every table (§6.3): 3 legacy spellings, 3 widths → one. */
export const kantorId = (name = 'kantor_id') => varchar(name, { length: 10 });

/** Unified region key (§6.3): was int(2) / varchar(16) / varchar(50). */
export const wilayahId = (name = 'id_wilayah_pembinaan') => bigint(name, { mode: 'number' });

/** Legacy audit quadruple present on most tables. */
export const audit = () => ({
  userInsert: varchar('user_insert', { length: 30 }),
  dateInsert: timestamp('date_insert', { withTimezone: true }),
  userUpdate: varchar('user_update', { length: 30 }),
  dateUpdate: timestamp('date_update', { withTimezone: true }),
});

const quote = (v: string) => `'${v.replace(/'/g, "''")}'`;

/**
 * CHECK constraint restricting a column to a value list from lib/enums.ts.
 * Replaces `CREATE TYPE … AS ENUM`, which PRD §2.1 rule 4 forbids.
 */
export const oneOf = (name: string, column: string, values: readonly string[]): SQL =>
  sql.raw(`${column} IN (${values.map(quote).join(', ')})`);

export const checkOneOf = (name: string, column: string, values: readonly string[]) =>
  check(name, oneOf(name, column, values));

/** Same, for a nullable column: NULL is always allowed. */
export const checkOneOfNullable = (
  name: string,
  column: string,
  values: readonly string[],
) =>
  check(
    name,
    sql.raw(`${column} IS NULL OR ${column} IN (${values.map(quote).join(', ')})`),
  );
