import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{
  const i = l.indexOf('=');
  return [l.slice(0,i), l.slice(i+1).replace(/^"|"$/g,'')];
}));
const conn = await mysql.createConnection({
  host: env.HOST_DB, port: Number(env.PORT_DB), user: env.USER_DB, password: env.PASS_DB,
  database: env.DB_NAME, connectTimeout: 10000,
});
async function time(label, sql, params=[]) {
  const t0 = Date.now();
  try {
    const [rows] = await conn.execute(sql, params);
    console.log(label, Date.now()-t0, 'ms, rows:', Array.isArray(rows)?rows.length:rows);
  } catch(e) {
    console.log(label, 'ERROR', e.message);
  }
}
await time('tahun=2024 count', "SELECT COUNT(*) c FROM ajis_penyaluran WHERE tahun='2024'");
await time('tahun=2025 limit11', "SELECT id_row FROM ajis_penyaluran WHERE tahun='2025' LIMIT 11");
await time('tahun=2026 limit11', "SELECT id_row FROM ajis_penyaluran WHERE tahun='2026' LIMIT 11");
await time('processlist', "SHOW PROCESSLIST");
await conn.end();
