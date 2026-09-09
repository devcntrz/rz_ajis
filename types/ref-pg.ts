/**
 * types/ref-pg.ts — TS shapes for the Postgres administrative reference
 * tables (db/schema/ref.ts): ref_propinsi, ref_kabupaten, ref_kecamatan,
 * ref_desa. Field names are camelCase, one-to-one with the Drizzle
 * column() calls. Mirrors types/wilayah-pg.ts / types/kantor-pg.ts.
 */

/* ---------------------------------------------------------------------- */
/* Propinsi                                                                */
/* ---------------------------------------------------------------------- */

export interface RefPropinsiPg {
  id: number;
  propid: string;
  propinsi: string;
  ibukota: string | null;
  aktif: boolean;
}

export type RefPropinsiPgListItem = RefPropinsiPg;

export interface RefPropinsiPgListParams {
  q?: string;
  aktif?: string;
  page?: string | number;
  limit?: string | number;
}

/** `propid` is required on create (manual, not generated) and immutable on
 *  update — route handlers ignore it in the PUT body. */
export type RefPropinsiPgInput = Partial<Omit<RefPropinsiPg, 'id'>>;

export interface RefPropinsiPgListResponse {
  data: RefPropinsiPgListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface RefPropinsiLookupItem {
  propid: string;
  propinsi: string;
}

/* ---------------------------------------------------------------------- */
/* Kabupaten                                                               */
/* ---------------------------------------------------------------------- */

export interface RefKabupatenPg {
  id: number;
  kabid: string;
  propid: string;
  namaPropinsi: string | null;
  kabupaten: string;
  kota: boolean;
  ibukota: string | null;
  aktif: boolean;
}

export type RefKabupatenPgListItem = RefKabupatenPg;

export interface RefKabupatenPgListParams {
  q?: string;
  propid?: string;
  aktif?: string;
  page?: string | number;
  limit?: string | number;
}

/** `kabid` is server-generated on create and immutable on update — never
 *  send it in the body. `propid` is required on create (selects the parent
 *  and drives generation) but immutable afterward. */
export type RefKabupatenPgInput = Partial<Omit<RefKabupatenPg, 'id' | 'kabid' | 'namaPropinsi'>>;

export interface RefKabupatenPgListResponse {
  data: RefKabupatenPgListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface RefKabupatenLookupItem {
  kabid: string;
  kabupaten: string;
  propid: string;
}

/* ---------------------------------------------------------------------- */
/* Kecamatan                                                               */
/* ---------------------------------------------------------------------- */

export interface RefKecamatanPg {
  id: number;
  camatid: string;
  namaKecamatan: string;
  kodepos: string | null;
  kabid: string;
  namaKabupaten: string | null;
  aktif: boolean;
}

export type RefKecamatanPgListItem = RefKecamatanPg;

export interface RefKecamatanPgListParams {
  q?: string;
  kabid?: string;
  aktif?: string;
  page?: string | number;
  limit?: string | number;
}

/** `camatid` is server-generated on create and immutable on update. */
export type RefKecamatanPgInput = Partial<Omit<RefKecamatanPg, 'id' | 'camatid' | 'namaKabupaten'>>;

export interface RefKecamatanPgListResponse {
  data: RefKecamatanPgListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface RefKecamatanLookupItem {
  camatid: string;
  namaKecamatan: string;
  kabid: string;
}

/* ---------------------------------------------------------------------- */
/* Desa / Kelurahan                                                        */
/* ---------------------------------------------------------------------- */

export interface RefDesaPg {
  id: number;
  desaid: string;
  namaDesa: string;
  kelurahan: boolean;
  camatid: string;
  namaKecamatan: string | null;
  propid: string | null;
  kabid: string | null;
  nomorIndukDesa: string | null;
  aktif: boolean;
}

export type RefDesaPgListItem = RefDesaPg;

export interface RefDesaPgListParams {
  q?: string;
  camatid?: string;
  aktif?: string;
  page?: string | number;
  limit?: string | number;
}

/** `desaid` is server-generated on create and immutable on update. */
export type RefDesaPgInput = Partial<Omit<RefDesaPg, 'id' | 'desaid' | 'namaKecamatan'>>;

export interface RefDesaPgListResponse {
  data: RefDesaPgListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface RefDesaLookupItem {
  desaid: string;
  namaDesa: string;
  camatid: string;
}
