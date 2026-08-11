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

/** True when user may access Ajuan Ganti Anak / Anak Juara pairing modules. */
export function isGroup12(session: SessionData): boolean {
  return session.idGroupUser === 1 || session.idGroupUser === 2;
}

/**
 * Throws if session is not group 1 (Admin) or 2 (SpMD Cabang).
 * Call after getSession / requireSession in protected ajuan routes.
 */
export function requireGroup12(session: SessionData): void {
  if (!isGroup12(session)) {
    throw new Error('Forbidden');
  }
}

/**
 * Kantor isolation for pairing / ajuan modules.
 * - Group 1: no forced filter (optional UI kantor param applied by caller)
 * - Group 2: always force session.idKantor; ignore client kantor
 *
 * Column names differ by table:
 * - ajis_pemasangan / ajis_anak → kantor_id
 * - ajis_view_ajuan → id_kantor
 */
export function getKantorScope(
  session: SessionData,
  column: 'kantor_id' | 'id_kantor' = 'kantor_id',
  tableAlias = '',
): { sql: string; params: unknown[]; forcedKantor: string | null } {
  const prefix = tableAlias ? `${tableAlias}.` : '';

  if (session.idGroupUser === 1) {
    return { sql: '1=1', params: [], forcedKantor: null };
  }
  if (session.idGroupUser === 2) {
    return {
      sql:          `${prefix}${column} = ?`,
      params:       [session.idKantor],
      forcedKantor: session.idKantor,
    };
  }
  // Other groups should not reach ajuan APIs; keep safe empty scope
  return { sql: '1=0', params: [], forcedKantor: null };
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
