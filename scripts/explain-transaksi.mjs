/**
 * scripts/explain-transaksi.mjs — read-only performance diagnostic for the Transaksi module.
 *
 * Run:  node --env-file=.env scripts/explain-transaksi.mjs
 *
 * Issues nothing but EXPLAIN and SELECT. Safe against production.
 *
 * ── Baseline measured 19 Aug 2026 against production (222.563 transaksi,
 *    403.998 ajis_input_donasi, network RTT ≈ 23 ms) ─────────────────────────────
 *
 *   PK lookup (transaksi, ajis_anak) ........  25 ms   ← indexed, effectively free
 *   Grid page (list + count + footer) .......  563 ms  ← type=ALL, full scan + filesort
 *   SELECT/DELETE by transid ................  ~600 ms ← type=ALL, no index on transid
 *
 * Every grid and entry query is a full table scan, because no existing index leads with
 * the columns this module filters on. This is NOT a regression — legacy scanned exactly
 * the same way, and additionally issued two extra SUM queries per grid row (measured:
 * 11.207 ms of avoidable work per 10-row page, now zero).
 *
 * ── Recommended indexes — NOT applied, they need DBA approval ────────────────────
 * CLAUDE.md forbids schema changes, so these are reported rather than executed. Each
 * turns a ~550 ms scan into a ~25 ms lookup.
 *
 *   -- Hot path: every Entry/Update Cashflow does DELETE + SELECT SUM by transid,
 *   -- and ajis_input_donasi.transid is TEXT with no index at all.
 *   ALTER TABLE ajis_input_donasi ADD KEY idx_trans (transid(50), detailid);
 *
 *   -- Grid tabs: the fixed base filters review + cicilan, then ranges on a date.
 *   ALTER TABLE transaksi ADD KEY idx_grid_trx (review, cicilan, tgl_transaksi);
 *   ALTER TABLE transaksi ADD KEY idx_grid_don (review, cicilan, tgl_donasi);
 *
 *   -- Bulk approve currently scans the whole `did` index to resolve id_review IN (...).
 *   ALTER TABLE transaksi ADD KEY idx_review (id_review);
 */
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host:           process.env.HOST_DB,
  port:           Number(process.env.PORT_DB ?? 3306),
  user:           process.env.USER_DB,
  password:       process.env.PASS_DB,
  database:       process.env.DB_NAME,
  connectTimeout: 90_000,
});

const T0 = '2026-01-01';
const T1 = '2026-12-31';
const KANTOR = '1';

const MAIN_BASE = `a.review='y' AND a.cicilan='n' AND a.perkiraan_rp>0
  AND a.approve_salur<>'' AND a.oid_donatur<>''`;

const CASES = [
  ['list main (pusat)', `
    SELECT a.transid, a.detailid, a.perkiraan_rp, a.total_input_donasi, a.selisih_donasi
    FROM transaksi a
    WHERE ${MAIN_BASE} AND a.tgl_transaksi BETWEEN ? AND ?
    ORDER BY a.nama_donatur ASC, a.tgl_transaksi ASC LIMIT 10`, [T0, T1]],

  ['list main (cabang, FIND_IN_SET)', `
    SELECT a.transid, a.detailid FROM transaksi a
    WHERE ${MAIN_BASE} AND a.tgl_transaksi BETWEEN ? AND ?
      AND a.review='y' AND a.approve_salur='y' AND FIND_IN_SET(?, a.id_kantor_ijis)
    ORDER BY a.nama_donatur ASC LIMIT 10`, [T0, T1, KANTOR]],

  ['count main', `
    SELECT COUNT(*) AS total FROM transaksi a
    WHERE ${MAIN_BASE} AND a.tgl_transaksi BETWEEN ? AND ?`, [T0, T1]],

  ['footer sum main', `
    SELECT COALESCE(SUM(a.perkiraan_rp),0) AS total FROM transaksi a
    WHERE ${MAIN_BASE} AND a.tgl_transaksi BETWEEN ? AND ?
      AND a.approve_salur='y' AND a.review='y' AND a.cicilan='n'`, [T0, T1]],

  ['list review', `
    SELECT a.transid FROM transaksi a
    WHERE a.review<>'y' AND a.perkiraan_rp>0 AND a.tgl_transaksi BETWEEN ? AND ?
    ORDER BY a.nama_donatur ASC LIMIT 10`, [T0, T1]],

  ['list unidentified', `
    SELECT a.transid FROM transaksi a
    WHERE a.id_kantor_ijis='' AND a.perkiraan_rp>0 AND a.oid_donatur<>''
      AND a.tgl_transaksi BETWEEN ? AND ? ORDER BY a.nama_donatur ASC LIMIT 10`, [T0, T1]],

  ['detail by PK', `
    SELECT a.transid FROM transaksi a WHERE a.transid=? AND a.detailid=? LIMIT 1`, ['X', 1]],

  ['** hot ** entries by transid', `
    SELECT a.id_input_donasi FROM ajis_input_donasi a WHERE a.transid=? AND a.detailid=?`,
    ['X', 1]],

  ['** hot ** SUM nominal by transid', `
    SELECT COALESCE(SUM(nominal_donasi),0) AS t FROM ajis_input_donasi
    WHERE transid=? AND detailid=?`, ['X', 1]],

  ['candidates (entry grid)', `
    SELECT a.id_pemasangan_baru, COALESCE(MAX(s.harga_program), MAX(a.harga_program),0) AS harga
    FROM ajis_pemasangan a
    LEFT JOIN setting_program s ON s.id_program = a.id_program
    WHERE a.id_donatur=? AND a.program_donasi=? AND a.tahun=? AND a.status_pasangan='y'
    GROUP BY a.id_pemasangan_baru ORDER BY a.nama_anak ASC`, ['X', 'Juara', '2026']],

  ['anak snapshot IN()', `
    SELECT id_anak, nama_lengkap FROM ajis_anak WHERE id_anak IN (?,?,?)`, ['a', 'b', 'c']],

  ['bulk approve by id_review', `
    SELECT a.transid FROM transaksi a WHERE a.id_review IN (?,?)`, ['x1', 'x2']],
];

console.log('=== EXPLAIN ===');
for (const [name, sql, params] of CASES) {
  try {
    const [rows] = await conn.query(`EXPLAIN ${sql}`, params);
    console.log(`\n### ${name}`);
    for (const r of rows) {
      const flag = r.type === 'ALL' ? '  ⚠ FULL SCAN' : '';
      console.log(
        `  table=${r.table ?? '-'} type=${r.type} key=${r.key ?? 'NULL'} ` +
        `rows=${r.rows} extra=${r.Extra ?? ''}${flag}`,
      );
    }
  } catch (e) {
    console.log(`\n### ${name}\n  ERROR: ${e.message}`);
  }
}

console.log('\n=== TIMING (includes network RTT) ===');
for (const [name, sql, params] of CASES) {
  const t = Date.now();
  try {
    await conn.query(sql, params);
    console.log(`${String(Date.now() - t).padStart(6)} ms  ${name}`);
  } catch {
    console.log(`     -  ${name} (skipped)`);
  }
}

const [sizes] = await conn.query(
  `SELECT table_name AS t, table_rows AS r FROM information_schema.tables
   WHERE table_schema = ? AND table_name IN
     ('transaksi','ajis_input_donasi','ajis_pemasangan','ajis_anak','setting_program')`,
  [process.env.DB_NAME],
);
console.log('\n=== approx table_rows ===');
for (const s of sizes) console.log(`  ${s.t}: ${s.r}`);

await conn.end();
