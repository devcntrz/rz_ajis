/**
 * types/wilayah-pg.ts — TS shapes for the Postgres `ajis_wilayah_pembinaan`
 * table (db/schema/sdm.ts, ajisWilayahPembinaan). Field names are camelCase,
 * one-to-one with the Drizzle column() calls in db/schema/sdm.ts.
 *
 * `ajis_wilayah_pembinaan` is coaching-region master data: every wilayah row
 * belongs to one kantor (kantor_id → ajis_kantor.oid, denormalized as
 * nama_kantor) and is itself the scoping unit for Korwil sessions
 * (session.idWilayahPembinaan), the same way ajis_kantor rows scope Branch
 * Admin sessions.
 */

/** Full `ajis_wilayah_pembinaan` row, as returned by
 *  GET /api/anakjuara/pg/wilayah/[id]. */
export interface AjisWilayahPg {
  idWilayahPembinaan: number;
  namaWilayah: string;
  alamatWilayah: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  /** 'y' | 't' — see lib/enums.ts STATUS_APPROVE. */
  statusApprove: string | null;
  propid: string | null;
  namaPropinsi: string | null;
  kabid: string | null;
  namaKabupaten: string | null;
  camatid: string | null;
  namaKecamatan: string | null;
  desaid: string | null;
  namaDesa: string | null;
  aktif: boolean;
}

/** Summary columns for GET /api/anakjuara/pg/wilayah (list view). */
export interface AjisWilayahPgListItem {
  idWilayahPembinaan: number;
  namaWilayah: string;
  alamatWilayah: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  statusApprove: string | null;
  namaPropinsi: string | null;
  namaKabupaten: string | null;
  namaKecamatan: string | null;
  namaDesa: string | null;
  aktif: boolean;
}

/** Query params accepted by GET /api/anakjuara/pg/wilayah. */
export interface AjisWilayahPgListParams {
  q?: string;
  kantor_id?: string;
  aktif?: string;
  page?: string | number;
  limit?: string | number;
}

/** Body accepted by POST (create) and PUT (update) — `namaWilayah` is required
 *  by the create handler; every field is otherwise optional. */
export type AjisWilayahPgInput = Partial<Omit<AjisWilayahPg, 'idWilayahPembinaan'>>;

export interface AjisWilayahPgListResponse {
  data: AjisWilayahPgListItem[];
  total: number;
  page: number;
  limit: number;
}

/** Response row for GET /api/anakjuara/pg/wilayah/lookup — kept minimal, this
 *  is the contract cascading Kantor→Wilayah pickers (Manajemen User, Pengajuan
 *  Beasiswa) link against, mirroring AjisKantorLookupItem. */
export interface AjisWilayahLookupItem {
  idWilayahPembinaan: number;
  namaWilayah: string;
  kantorId: string | null;
}
