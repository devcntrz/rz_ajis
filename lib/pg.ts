/**
 * lib/pg.ts — Neon Postgres pool. Primary database (PRD §5.1).
 *
 * Mirrors the lib/db.ts (MySQL) API 1:1 so route handlers port mechanically.
 * The one syntactic difference: placeholders are $1, $2 … not ?.
 *
 * Raw SQL only. Never import drizzle here (PRD §2.1 rule 1).
 */
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import pgTypes from 'pg-types';

// Every money column is numeric (PRD §6.1) and must never round-trip through a
// JS float. int8 likewise exceeds Number.MAX_SAFE_INTEGER. Both stay strings.
pgTypes.setTypeParser(pgTypes.builtins.NUMERIC, (v: string) => v);
pgTypes.setTypeParser(pgTypes.builtins.INT8, (v: string) => v);
// `date` (not timestamptz) stays a plain 'YYYY-MM-DD' string — no timezone shifting.
pgTypes.setTypeParser(pgTypes.builtins.DATE, (v: string) => v);

const pool = new Pool({
  // Pooled (-pooler) host is mandatory for the app runtime (PRD §9.6).
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

pool.on('error', (err) => console.error('[pg] idle client error', err));

// NOTE on time zones: mysql2's `timezone: '+07:00'` has no safe client-side
// equivalent here. A session-level `SET TIME ZONE` leaks between requests under
// PgBouncer transaction pooling. Store timestamptz and format to Asia/Jakarta at
// the UI edge instead.

export async function query<T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query<T>(sql, params as unknown[]);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Single-statement write outside a transaction. Returns affected row count.
 *
 * mysql2's ResultSetHeader.insertId has no Postgres analogue — use
 * executeReturning with `RETURNING id` instead.
 */
export async function execute(sql: string, params?: unknown[]): Promise<number> {
  const res = await pool.query(sql, params as unknown[]);
  return res.rowCount ?? 0;
}

/** INSERT/UPDATE … RETURNING outside a transaction. */
export async function executeReturning<T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query<T>(sql, params as unknown[]);
  return res.rows;
}

export type TxConnection = PoolClient;

/** Run work inside a single transaction (BEGIN / COMMIT / ROLLBACK). PRD §2.1 rule 7. */
export async function withTransaction<T>(
  fn: (conn: TxConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');
    const result = await fn(conn);
    await conn.query('COMMIT');
    return result;
  } catch (err) {
    await conn.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export async function txQuery<T extends QueryResultRow>(
  conn: TxConnection,
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await conn.query<T>(sql, params as unknown[]);
  return res.rows;
}

export async function txQueryOne<T extends QueryResultRow>(
  conn: TxConnection,
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await txQuery<T>(conn, sql, params);
  return rows[0] ?? null;
}

export async function txExecute(
  conn: TxConnection,
  sql: string,
  params?: unknown[],
): Promise<number> {
  const res = await conn.query(sql, params as unknown[]);
  return res.rowCount ?? 0;
}

export async function txExecuteReturning<T extends QueryResultRow>(
  conn: TxConnection,
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await conn.query<T>(sql, params as unknown[]);
  return res.rows;
}

/*
 * Deliberately NOT ported from lib/db.ts: queryUnprepared / txQueryUnprepared.
 * `pg` only prepares a statement when you pass a `name`, so query() already
 * behaves like the unprepared path.
 *
 * When porting those call sites (lib/transaksi/*, lib/keuangan.ts): a naive
 * `IN (?)` → `IN ($1)` rewrite silently breaks, because pg binds the array as a
 * single value. Use `= ANY($1::text[])`, or UNNEST for bulk inserts.
 */

export default pool;
