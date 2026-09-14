/**
 * lib/db.ts — MySQL connection pool
 * Uses real env var names from .env: HOST_DB, USER_DB, PASS_DB, PORT_DB, DB_NAME
 */
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.HOST_DB,
  port:     Number(process.env.PORT_DB ?? 3306),
  user:     process.env.USER_DB,
  password: process.env.PASS_DB,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  connectTimeout:     10_000,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 10_000,
  timezone:           '+07:00',
  charset:            'utf8mb4',
});

export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Single-statement write outside a transaction. Use withTransaction for multi-table work. */
export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

export type TxConnection = mysql.PoolConnection;

/** Run work inside a single DB transaction (BEGIN / COMMIT / ROLLBACK). */
export async function withTransaction<T>(
  fn: (conn: TxConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

function isLockWaitTimeout(err: unknown): boolean {
  const code = (err as { code?: string; errno?: number } | null)?.code;
  const errno = (err as { code?: string; errno?: number } | null)?.errno;
  return code === 'ER_LOCK_WAIT_TIMEOUT' || errno === 1205;
}

/**
 * Same as withTransaction, but retries the whole transaction a few times when it
 * fails purely on "Lock wait timeout exceeded" — a transient collision with another
 * writer on the same row(s), not a data problem. Any other error still throws
 * immediately, as does a lock timeout that persists past the last attempt.
 */
export async function withTransactionRetry<T>(
  fn: (conn: TxConnection) => Promise<T>,
  { retries = 3, delayMs = 300 }: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await withTransaction(fn);
    } catch (err) {
      if (attempt >= retries || !isLockWaitTimeout(err)) throw err;
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
}

export async function txQuery<T>(
  conn: TxConnection,
  sql: string,
  params?: any[],
): Promise<T[]> {
  const [rows] = await conn.execute(sql, params);
  return rows as T[];
}

export async function txQueryOne<T>(
  conn: TxConnection,
  sql: string,
  params?: any[],
): Promise<T | null> {
  const rows = await txQuery<T>(conn, sql, params);
  return rows[0] ?? null;
}

export async function txExecute(
  conn: TxConnection,
  sql: string,
  params?: any[],
): Promise<void> {
  await conn.execute(sql, params);
}

/** Like txExecute, but returns affectedRows / insertId. */
export async function txExecuteResult(
  conn: TxConnection,
  sql: string,
  params?: any[],
): Promise<mysql.ResultSetHeader> {
  const [result] = await conn.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

/**
 * Multi-row statements (batch INSERT, `IN (...)`) exceed the placeholder limit of a
 * prepared statement and, for a few hundred rows, are also markedly slower to prepare
 * than to run. `query()` sends them unprepared. Callers still pass every value through
 * `params` — this changes how the statement is transported, never how it is escaped.
 */
export async function txQueryUnprepared<T>(
  conn: TxConnection,
  sql: string,
  params?: any[],
): Promise<T> {
  const [result] = await conn.query(sql, params);
  return result as T;
}

/** Unprepared read outside a transaction. Same escaping rules as `query()`. */
export async function queryUnprepared<T>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export default pool;
