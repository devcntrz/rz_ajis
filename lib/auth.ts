/**
 * lib/auth.ts — Session management with iron-session
 * Role scoping based on real ajis_user schema:
 *   id_group_user = 1 → Super Admin (no filter)
 *   id_group_user = 2 → Branch Admin (filter by id_kantor)
 *   id_group_user = 9 → Korwil (filter by id_wilayah_pembinaan)
 */
import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId:              number;
  username:            string;
  namaKantor:          string;
  namaWilayah:         string;
  idKantor:            string;
  idGroupUser:         number;
  idWilayahPembinaan:  string;
  isLoggedIn:          boolean;
}

const sessionOptions = {
  cookieName:    'ajis_session',
  password:      process.env.SESSION_SECRET!,
  cookieOptions: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge:   86400 * 7, // 7 days
    sameSite: 'lax' as const,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error('Unauthorized');
  }
  return session as SessionData;
}

/**
 * Returns SQL WHERE fragment + params for role-based data scoping.
 * Adapts to real ajis_anak / ajis_pembinaan_baru table column names.
 */
export function getScopeCondition(
  session: SessionData,
  tableAlias = '',
): { sql: string; params: unknown[] } {
  const prefix = tableAlias ? `${tableAlias}.` : '';

  if (session.idGroupUser === 1) {
    // Super admin — no restriction
    return { sql: '1=1', params: [] };
  }
  if (session.idGroupUser === 2) {
    // Branch admin — filter by kantor_id (real column name in ajis_anak)
    return { sql: `${prefix}kantor_id = ?`, params: [session.idKantor] };
  }
  // Korwil — filter by id_wilayah_pembinaan (string in real schema)
  return {
    sql:    `${prefix}id_wilayah_pembinaan = ?`,
    params: [session.idWilayahPembinaan],
  };
}
