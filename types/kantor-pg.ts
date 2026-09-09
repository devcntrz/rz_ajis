/**
 * types/kantor-pg.ts — TS shapes for the Postgres `ajis_kantor` table
 * (db/schema/kantor.ts, migrated by db/migrations). Field names are camelCase,
 * one-to-one with the Drizzle column() calls in db/schema/kantor.ts (ajisKantor).
 *
 * `ajis_kantor` is a small global master table — every branch office, keyed by
 * the natural key `oid` that ajis_anak.kantor_id / ajis_wilayah_pembinaan.kantor_id
 * reference. There is no row-level scoping on this table (CLAUDE.md task notes):
 * a kantor row IS the scoping unit, not something scoped by it.
 */

/** Full `ajis_kantor` row, as returned by GET /api/anakjuara/pg/kantor/[id]. */
export interface AjisKantorPg {
  id: number;
  oid: string;
  kantor: string | null;
  alamat: string | null;
  noTelp: string | null;
  oidParent: string | null;
  oidParentSecond: string | null;
  jenis: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsonb bag, shape varies by legacy source system
  externalIds: any;
}

/** Summary columns for GET /api/anakjuara/pg/kantor (list view). */
export interface AjisKantorPgListItem {
  id: number;
  oid: string;
  kantor: string | null;
  alamat: string | null;
  noTelp: string | null;
  oidParent: string | null;
  oidParentSecond: string | null;
  jenis: string | null;
}

/** Query params accepted by GET /api/anakjuara/pg/kantor. */
export interface AjisKantorPgListParams {
  q?: string;
  oid_parent?: string;
  page?: string | number;
  limit?: string | number;
}

/** Body accepted by PUT (update) — `oid` is immutable once created (natural key
 *  other tables FK against) and is therefore never part of this shape; `kantor`
 *  is required non-empty when present, every other field is optional. */
export type AjisKantorPgInput = Partial<Omit<AjisKantorPg, 'id' | 'oid' | 'externalIds'>>;

/** Body accepted by POST (create) — same as AjisKantorPgInput; `oid` is always
 *  server-generated (see app/api/anakjuara/pg/kantor/route.ts POST) and must
 *  never be sent by the client. `kantor` is required. */
export type AjisKantorPgCreateInput = AjisKantorPgInput;

export interface AjisKantorPgListResponse {
  data: AjisKantorPgListItem[];
  total: number;
  page: number;
  limit: number;
}

/** Response row for GET /api/anakjuara/pg/kantor/lookup — kept minimal, this is
 *  the contract other features (e.g. Data Wilayah Pembinaan's kantor picker) link
 *  against. */
export interface AjisKantorLookupItem {
  oid: string;
  kantor: string | null;
}
