/**
 * types/anak-pg.ts — TS shapes for the Postgres `ajis_anak` table
 * (db/schema/anak.ts, migrated by db/migrations/0001_initial_schema.sql).
 *
 * Field names are camelCase, one-to-one with the Drizzle column() calls in
 * db/schema/anak.ts (which itself maps to the snake_case DB columns). This file is
 * runtime-safe to import from app/ and hooks/ — it carries no drizzle import.
 *
 * Note: unlike some other Postgres tables (ajis_sdm_wilayah, ref_*, ajis_survey),
 * `ajis_anak` does NOT carry the audit() quadruple (user_insert/date_insert/
 * user_update/date_update) — confirmed against db/schema/anak.ts and
 * db/migrations/0001_initial_schema.sql, neither of which spread audit() into this
 * table. There is nothing to stamp on write.
 */

/** Full `ajis_anak` row, as returned by GET /api/anakjuara/pg/anak/[id]. */
export interface AnakPg {
  id: number;
  idAnak: string;
  nik: string | null;
  namaLengkap: string;
  namaPanggilan: string | null;
  agama: string | null;
  jnsKel: 'l' | 'p' | null;
  tempatLahir: string | null;
  tglLahir: string | null;
  anakKe: number | null;
  dariSaudara: number | null;

  // domicile
  alamat: string | null;
  propid: string | null;
  namaPropinsi: string | null;
  kabid: string | null;
  namaKabupaten: string | null;
  camatid: string | null;
  namaKecamatan: string | null;
  desaid: string | null;
  namaDesa: string | null;

  // education
  jenjangPendidikan: string | null;
  kelas: string | null;
  namaSekolah: string | null;
  alamatSekolah: string | null;
  jurusan: string | null;
  semester: number | null;
  namaPt: string | null;
  alamatPt: string | null;
  nilai: string | null;
  pelajaranFavorit: string | null;
  jarakRumah: string | null;
  alatTransportasi: string | null;
  hobi: string | null;
  prestasi: string | null;

  // banking
  noRekening: string | null;
  pemilikRekening: string | null;
  namaBank: string | null;

  foto: string | null;
  noKartuKeluarga: string | null;
  asnaf: string | null;
  statusOrtu: string | null;

  // status flags
  statusSurvey: boolean;
  statusKelayakan: boolean;
  statusAnakJuara: string | null;
  statusTersantuni: 'su' | 'b' | 'se' | 't' | null;
  statusPinjam: boolean;
  statusMentor: boolean;
  aktif: boolean;
  alumniJuara: boolean | null;
  juara: string | null;
  approvalIjf: string | null;
  viaInput: string | null;

  // scope
  idWilayahPembinaan: number | null;
  namaWilayah: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  idSdm: number | null;
  namaMentor: string | null;

  tglTerdaftar: string | null;
  tglPengajuan: string | null;

  // father
  namaLengkapAyah: string | null;
  alamatAyah: string | null;
  propidAyah: string | null;
  namaPropinsiAyah: string | null;
  kabidAyah: string | null;
  namaKabupatenAyah: string | null;
  camatidAyah: string | null;
  namaKecamatanAyah: string | null;
  desaidAyah: string | null;
  namaDesaAyah: string | null;
  pekerjaanAyah: string | null;
  penghasilanRataRataAyah: string | null;
  tanggalKematianAyah: string | null;
  penyebabKematianAyah: string | null;

  // mother
  namaLengkapIbu: string | null;
  alamatIbu: string | null;
  propidIbu: string | null;
  namaPropinsiIbu: string | null;
  kabidIbu: string | null;
  namaKabupatenIbu: string | null;
  camatidIbu: string | null;
  namaKecamatanIbu: string | null;
  desaidIbu: string | null;
  namaDesaIbu: string | null;
  pekerjaanIbu: string | null;
  penghasilanRataRataIbu: string | null;
  tanggalKematianIbu: string | null;
  penyebabKematianIbu: string | null;

  // guardian
  namaLengkapWali: string | null;
  alamatWali: string | null;
  propidWali: string | null;
  namaPropinsiWali: string | null;
  kabidWali: string | null;
  namaKabupatenWali: string | null;
  camatidWali: string | null;
  namaKecamatanWali: string | null;
  desaidWali: string | null;
  namaDesaWali: string | null;
  pekerjaanWali: string | null;
  penghasilanRataRataWali: string | null;

  telpYangBisaDihubungi: string | null;
  atasNama: string | null;
  hubunganKerabat: string | null;

  // living arrangement
  tinggalBersama: string | null;
  namaTinggal: string | null;
  ketTinggal: string | null;
  penghasilanTinggal: string | null;
  pekerjaanTinggal: string | null;
  tidakSerumahOrtu: boolean | null;

  // RFO booking
  niaRfoBook: string | null;
  namaRfoBook: string | null;
  tglPeminjaman: string | null;
  tglExpired: string | null;
  bookVia: string | null;
  userBook: string | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsonb bag, shape varies by legacy source system
  externalIds: any;
}

/** Summary columns for GET /api/anakjuara/pg/anak (list view). */
export interface AnakPgListItem {
  idAnak: string;
  namaLengkap: string;
  namaPanggilan: string | null;
  jnsKel: 'l' | 'p' | null;
  jenjangPendidikan: string | null;
  kelas: string | null;
  namaSekolah: string | null;
  asnaf: string | null;
  statusOrtu: string | null;
  statusAnakJuara: string | null;
  idWilayahPembinaan: number | null;
  namaWilayah: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  tglLahir: string | null;
  tglTerdaftar: string | null;
  foto: string | null;
  telpYangBisaDihubungi: string | null;
  aktif: boolean;
}

/** Query params accepted by GET /api/anakjuara/pg/anak. */
export interface AnakPgListParams {
  q?: string;
  jenjang_pendidikan?: string;
  asnaf?: string;
  status_anak_juara?: string;
  id_wilayah_pembinaan?: string;
  page?: string | number;
  limit?: string | number;
}

/**
 * Body accepted by POST (create) and PUT (update) — every field optional except
 * on create, where namaLengkap is required by the handler. `idAnak` is
 * server-generated on create (see generateIdAnak in the POST route handler,
 * porting the legacy GenerateID_anak() PHP algorithm) and immutable on update
 * (ANAK_WRITABLE_FIELDS excludes it) — any client-sent idAnak is ignored.
 */
export type AnakPgInput = Partial<Omit<AnakPg, 'id'>>;

/** Response row for GET /api/anakjuara/pg/anak/lookup — kept snake_case & minimal, this is the contract other features (e.g. Data Survey) link against. */
export interface AnakPgLookupItem {
  id_anak: string;
  nama_lengkap: string;
}

export interface AnakPgListResponse {
  data: AnakPgListItem[];
  total: number;
  page: number;
  limit: number;
}
