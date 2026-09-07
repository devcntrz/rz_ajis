import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{
  const i = l.indexOf('=');
  return [l.slice(0,i), l.slice(i+1).replace(/^"|"$/g,'')];
}));

const pool = mysql.createPool({
  host: env.HOST_DB, port: Number(env.PORT_DB), user: env.USER_DB, password: env.PASS_DB,
  database: env.DB_NAME, connectTimeout: 10000,
});

async function time(label, sql, params=[]) {
  const t0 = Date.now();
  try {
    const [rows] = await pool.execute(sql, params);
    console.log(label, Date.now()-t0, 'ms, rows:', Array.isArray(rows)?rows.length:rows);
  } catch(e) {
    console.log(label, 'ERROR', e.message);
  }
}

await time('ping select 1', 'SELECT 1');
await time('count all ajis_penyaluran', 'SELECT COUNT(*) as c FROM ajis_penyaluran');
await time('count tahun=2026', "SELECT COUNT(*) as c FROM ajis_penyaluran WHERE tahun = '2026'");
await time('count tahun=2025', "SELECT COUNT(*) as c FROM ajis_penyaluran WHERE tahun = '2025'");
await time('show indexes', 'SHOW INDEX FROM ajis_penyaluran');
await pool.end();
