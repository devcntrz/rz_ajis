/**
 * Export full table structures + 5 sample rows per table to SQL file.
 * Prefers ORDER BY time-related columns when available.
 */
import fs from 'fs';
import mysql from 'mysql2/promise';

const TIME_COLUMN_PATTERNS = [
  /^created_at$/i,
  /^updated_at$/i,
  /^date_insert$/i,
  /^date_update$/i,
  /^tgl_insert$/i,
  /^tgl_update$/i,
  /^insert_date$/i,
  /^update_date$/i,
  /^date_created$/i,
  /^date_modified$/i,
  /^timestamp$/i,
  /^created$/i,
  /^modified$/i,
];

const DATE_PREFIX_PATTERNS = [
  /^tgl_insert$/i,
  /^tgl_terdaftar$/i,
  /^tgl_pengajuan$/i,
  /^tgl_pembinaan$/i,
  /^tgl_/i,
  /^tanggal_/i,
  /^date_/i,
];

function pickOrderColumn(columns) {
  const names = columns.map((c) => c.Field);

  for (const pattern of TIME_COLUMN_PATTERNS) {
    const hit = names.find((n) => pattern.test(n));
    if (hit) return hit;
  }

  for (const name of names) {
    if (/timestamp|datetime/i.test(columns.find((c) => c.Field === name)?.Type ?? '')) {
      return name;
    }
  }

  for (const pattern of DATE_PREFIX_PATTERNS) {
    const hit = names.find((n) => pattern.test(n));
    if (hit) return hit;
  }

  const pk = columns.find((c) => c.Key === 'PRI');
  if (pk) return pk.Field;

  return names[0] ?? null;
}

function escapeValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return `'0000-00-00 00:00:00'`;
    const iso = val.toISOString().slice(0, 19).replace('T', ' ');
    return `'${iso}'`;
  }
  if (Buffer.isBuffer(val)) return `X'${val.toString('hex')}'`;
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'bigint') return val.toString();
  if (typeof val === 'object') return `'${mysql.escape(val).slice(1, -1)}'`;
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

function buildInsert(table, rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `\`${c}\``).join(', ');
  const values = rows
    .map((row) => {
      const vals = cols.map((c) => escapeValue(row[c]));
      return `(${vals.join(', ')})`;
    })
    .join(',\n');
  return `INSERT INTO \`${table}\` (${colList}) VALUES\n${values};\n`;
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.HOST_DB,
    port: Number(process.env.PORT_DB ?? 3306),
    user: process.env.USER_DB,
    password: process.env.PASS_DB,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  const dbName = process.env.DB_NAME;
  const outPath = new URL('../refs/sipc_ijf_sample.sql', import.meta.url).pathname;

  let sql = `-- AJIS / sipc_ijf sample database export\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Database: ${dbName}\n`;
  sql += `-- Structure: all tables + views\n`;
  sql += `-- Data: up to 5 rows per table (views skipped)\n\n`;
  sql += `SET NAMES utf8mb4;\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  const [tables] = await conn.query('SHOW FULL TABLES');
  const tableKey = Object.keys(tables[0] || {})[0];
  const typeKey = Object.keys(tables[0] || {})[1];

  const baseTables = [];
  const views = [];

  for (const row of tables) {
    const name = row[tableKey];
    const type = row[typeKey];
    if (type === 'VIEW') views.push(name);
    else baseTables.push(name);
  }

  sql += `-- ============================================================\n`;
  sql += `-- TABLE STRUCTURES (${baseTables.length} tables)\n`;
  sql += `-- ============================================================\n\n`;

  for (const table of baseTables) {
    const [createRows] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = createRows[0]['Create Table'];
    sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    sql += `${createSql};\n\n`;
  }

  if (views.length) {
    sql += `-- ============================================================\n`;
    sql += `-- VIEW DEFINITIONS (${views.length} views)\n`;
    sql += `-- ============================================================\n\n`;
    for (const view of views) {
      const [createRows] = await conn.query(`SHOW CREATE VIEW \`${view}\``);
      const createSql = createRows[0]['Create View'];
      sql += `DROP VIEW IF EXISTS \`${view}\`;\n`;
      sql += `${createSql};\n\n`;
    }
  }

  sql += `-- ============================================================\n`;
  sql += `-- SAMPLE DATA (5 rows per table)\n`;
  sql += `-- ============================================================\n\n`;

  for (const table of baseTables) {
    const [columns] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    const orderCol = pickOrderColumn(columns);
    const orderClause = orderCol ? `ORDER BY \`${orderCol}\` DESC` : '';
    const [rows] = await conn.query(`SELECT * FROM \`${table}\` ${orderClause} LIMIT 5`);

    sql += `-- Table: ${table}`;
    if (orderCol) sql += ` (ordered by \`${orderCol}\` DESC)`;
    sql += ` — ${rows.length} row(s)\n`;

    if (rows.length) {
      sql += buildInsert(table, rows);
    } else {
      sql += `-- (empty table)\n`;
    }
    sql += `\n`;
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`Written: ${outPath}`);
  console.log(`Tables: ${baseTables.length}, Views: ${views.length}`);
  console.log(`File size: ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`);

  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
