/**
 * types/user-pg.ts — TS shapes for the Postgres `ajis_user` / `ajis_group_user`
 * tables (db/schema/user.ts), used by the "Manajemen User" feature.
 *
 * Distinct from types/user.ts's `AjisUser`, which is the legacy MySQL login-row
 * shape consumed by app/api/anakjuara/auth/login/route.ts — that type is untouched.
 *
 * Field names are camelCase, one-to-one with the Drizzle column() calls in
 * db/schema/user.ts. Runtime-safe to import from app/ and hooks/ — carries no
 * drizzle import.
 */

/** Full `ajis_user` row, as returned by GET /api/anakjuara/pg/user/[id]. */
export interface AjisUserPg {
  idUser: number;
  username: string;
  email: string | null;
  nik: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  idWilayahPembinaan: number | null;
  namaWilayah: string | null;
  idGroupUser: number | null;
  /** Joined from ajis_group_user.group_user — not a column on ajis_user itself. */
  groupUser: string | null;
  aktif: boolean;
  userInsert: string | null;
  dateInsert: string | null;
}

/** Summary columns for GET /api/anakjuara/pg/user (list view). */
export interface AjisUserPgListItem {
  idUser: number;
  username: string;
  email: string | null;
  nik: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  idWilayahPembinaan: number | null;
  namaWilayah: string | null;
  idGroupUser: number | null;
  groupUser: string | null;
  aktif: boolean;
  dateInsert: string | null;
}

/** Query params accepted by GET /api/anakjuara/pg/user. */
export interface AjisUserPgListParams {
  q?: string;
  id_group_user?: string | number;
  aktif?: string;
  page?: string | number;
  limit?: string | number;
}

/** Body accepted by POST (create) and PUT (update). No password field — this
 *  table carries no password column (login stays legacy MySQL, §2.1a). */
export type AjisUserPgInput = Partial<Omit<AjisUserPg, 'idUser' | 'groupUser' | 'userInsert' | 'dateInsert'>>;

export interface AjisUserPgListResponse {
  data: AjisUserPgListItem[];
  total: number;
  page: number;
  limit: number;
}

/** `ajis_group_user` row for the role <select>. */
export interface AjisGroupUser {
  idGroupUser: number;
  groupUser: string;
  keterangan: string | null;
  aktif: boolean;
}
