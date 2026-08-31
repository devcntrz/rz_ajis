/**
 * db/schema/_shared.ts — column helpers shared by every table file.
 *
 * MIGRATION INPUT ONLY. Nothing under app/ or lib/ may import this (PRD §2.1 rule 1);
 * eslint enforces it.
 */
import { sql, type SQL } from 'drizzle-orm';
import { check, jsonb, numeric, timestamp, varchar, bigint } from 'drizzle-orm/pg-core';

/**
 * The surrogate primary key every table uses.
 *
 * `GENERATED ALWAYS`, not `bigserial`, and not `BY DEFAULT`. Three reasons:
 *
 *  1. The sequence is part of the column rather than a free-standing object, so it
 *     cannot be orphaned, separately dropped, or left behind by a partial restore.
 *  2. An INSERT that supplies an explicit id is REJECTED unless it says
 *     `OVERRIDING SYSTEM VALUE`. That is the point: the only way to desync a
 *     sequence is to load your own ids, and now every such place has to say so out
 *     loud — the seed and the migration-day ETL both do, and both must follow with
 *     `npm run db:fix-sequences`.
 *  3. It is the SQL standard spelling; `serial` is a PostgreSQL legacy form.
 *
 * Natural/business keys are NOT primary keys — they are `NOT NULL UNIQUE`, and
 * foreign keys reference them directly (Postgres allows an FK onto any UNIQUE
 * column). That keeps legacy identifiers as the join keys, so the ETL never has to
 * translate ids.
 */
export const pk = (name = 'id') =>
  bigint(name, { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity();

/** A bigint FK/lookup column pointing at another table's surrogate `pk()`. */
export const fk = (name: string) => bigint(name, { mode: 'number' });

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
