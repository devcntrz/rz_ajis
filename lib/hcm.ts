/**
 * lib/hcm.ts — read-only MySQL pool for `zains_rz.hcm_karyawan`.
 *
 * Separate from lib/db.ts (sipc_ijf, read/write) on purpose: this credential is
 * scoped to SELECT-only access on a different host/db, and mixing it into the
 * main pool would make that boundary invisible in code review. Never add a
 * write helper here.
 */
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.HOST_HCM_DB,
  port:     Number(process.env.PORT_HCM_DB ?? 3306),
  user:     process.env.USER_HCM_DB,
  password: process.env.PASS_HCM_DB,
  database: process.env.DB_HCM_NAME,
  waitForConnections: true,
  connectionLimit:    5,
  queueLimit:         0,
  connectTimeout:     10_000,
  charset:            'utf8mb4',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors lib/db.ts's mysql2 param typing
export async function hcmQuery<T>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export interface Karyawan {
  id_karyawan:        string;
  karyawan:            string;
  panggilan:           string;
  id_jabatan:          string;
  id_kantor:           number;
  id_karyawan_parent:  string;
}

const KARYAWAN_COLS = 'id_karyawan, karyawan, panggilan, id_jabatan, id_kantor, id_karyawan_parent';

/**
 * ZISCO employees (id_jabatan 1198/1078), plus every manager above them in the
 * `id_karyawan_parent` chain — legacy has no "peminjam" concept for staff at all,
 * so this whole lookup (jabatan filter + chain walk) is new, not ported.
 */
export async function fetchZiscoWithAtasan(): Promise<Karyawan[]> {
  const zisco = await hcmQuery<Karyawan>(
    `SELECT ${KARYAWAN_COLS} FROM hcm_karyawan
     WHERE id_jabatan IN ('1198', '1078') AND aktif = 'y'
     ORDER BY karyawan ASC`,
  );

  const byId = new Map<string, Karyawan>();
  zisco.forEach(k => byId.set(k.id_karyawan, k));

  // Walk each ZISCO employee's manager chain. Bounded to 10 hops as a guard
  // against a cyclical id_karyawan_parent in legacy data.
  let frontier = zisco
    .map(k => k.id_karyawan_parent)
    .filter((id): id is string => !!id && !byId.has(id));

  for (let hop = 0; hop < 10 && frontier.length > 0; hop++) {
    const unique = Array.from(new Set(frontier));
    const parents = await hcmQuery<Karyawan>(
      `SELECT ${KARYAWAN_COLS} FROM hcm_karyawan WHERE id_karyawan IN (${unique.map(() => '?').join(',')})`,
      unique,
    );
    parents.forEach(k => byId.set(k.id_karyawan, k));
    frontier = parents
      .map(k => k.id_karyawan_parent)
      .filter((id): id is string => !!id && !byId.has(id));
  }

  return Array.from(byId.values());
}

export default pool;
