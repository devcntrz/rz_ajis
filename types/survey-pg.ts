/**
 * types/survey-pg.ts — TS shapes for the Postgres `ajis_survey` table
 * (db/schema/survey.ts), used by the "Data Survey" feature.
 *
 * Field names are camelCase, one-to-one with the Drizzle column() calls in
 * db/schema/survey.ts (which itself maps to the snake_case DB columns). This
 * file is runtime-safe to import from app/, lib/, components/ and hooks/ — it
 * carries no drizzle import.
 *
 * Money columns (`biayaPendidikanSppPerbulan`, `jmlBantuanRutinDariLembagaLain`)
 * come back from Postgres as strings (lib/pg.ts's NUMERIC type parser) and stay
 * strings end-to-end — never parseFloat'd for storage/round-trip, mirroring how
 * anak-pg treats its numeric-as-string fields (e.g. `nilai`).
 */

/** Full `ajis_survey` row, as returned by GET /api/anakjuara/pg/survey/[id]. */
export interface AjisSurveyPg {
  idSurvey: number;
  tglSurvey: string | null;
  petugasSurvey: string | null;
  idAnak: string;

  // denormalized from ajis_anak at create time
  namaLengkap: string | null;
  namaLengkapAyah: string | null;
  namaLengkapIbu: string | null;
  namaLengkapWali: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  idWilayahPembinaan: string | null;
  namaWilayah: string | null;
  asnaf: string | null;
  alamat: string | null;
  namaPropinsi: string | null;
  namaKabupaten: string | null;
  namaKecamatan: string | null;
  namaDesa: string | null;
  jnsKel: string | null;
  jenjangPendidikan: string | null;
  tglPengajuan: string | null;
  statusAnak: string | null;

  hasilKesimpulanSurvey: string | null;

  // household assets & conditions
  kepemilikanTanah: string | null;
  kepemilikanRumah: string | null;
  kondisiDindingRumah: string | null;
  kondisiLantaiRumah: string | null;
  kepemilikanKendaraan: string | null;
  kepemilikanBarangElektronik: string | null;
  kepemilikanTabungan: string | null;
  pekerjaanKepalaKeluarga: string | null;
  rataRataPenghasilanPerbulan: string | null;
  makan2x: string | null;
  namaKepalaKeluarga: string | null;
  pendidikanTerakhirKepalaKeluarga: string | null;
  jmlTanggunganKepalaKeluarga: number | null;
  sumberAirBersih: string | null;
  jambanDanSaluranLimbah: string | null;
  tempatPembuanganSampah: string | null;
  terdapatPerokok: string | null;
  terdapatKonsumenMiras: string | null;
  terdapatPersediaanObatP3k: string | null;
  makanBuahDanSayurTiapHari: string | null;
  shalat5Waktu: string | null;
  membacaAlquran: string | null;
  majelisTaklim: string | null;
  membacaKoran: string | null;
  aktifSebagaiPengurusOrganisasi: string | null;

  asnafAnak: 'yatim' | 'piatu' | 'dhuafa' | null;
  /** NUMERIC — string, never parseFloat'd. */
  biayaPendidikanSppPerbulan: string | null;
  bantuanRutinDariLembagaLain: boolean | null;
  /** NUMERIC — string, never parseFloat'd. */
  jmlBantuanRutinDariLembagaLain: string | null;
  resumeDeskriptif: string | null;

  userInsert: string | null;
  dateInsert: string | null;
  userUpdate: string | null;
  dateUpdate: string | null;
}

/** Summary columns for GET /api/anakjuara/pg/survey (list view). */
export interface AjisSurveyPgListItem {
  idSurvey: number;
  tglSurvey: string | null;
  petugasSurvey: string | null;
  idAnak: string;
  namaLengkap: string | null;
  jnsKel: string | null;
  jenjangPendidikan: string | null;
  kantorId: string | null;
  namaKantor: string | null;
  idWilayahPembinaan: string | null;
  namaWilayah: string | null;
  asnaf: string | null;
  hasilKesimpulanSurvey: string | null;
  asnafAnak: 'yatim' | 'piatu' | 'dhuafa' | null;
  dateInsert: string | null;
}

/** Query params accepted by GET /api/anakjuara/pg/survey. */
export interface AjisSurveyPgListParams {
  q?: string;
  hasil_kesimpulan_survey?: string;
  id_wilayah_pembinaan?: string;
  page?: string | number;
  limit?: string | number;
}

/**
 * Body accepted by POST (create) and PUT (update). `idAnak` is required on
 * create (used to look up + denormalize the child) and immutable afterward —
 * same convention as anak-pg's `idAnak`. Denormalized bio fields are set by the
 * server from the looked-up `ajis_anak` row on create and are not client-writable
 * on update (mirrors anak-pg's idAnak-immutability pattern for the FK column).
 */
export type AjisSurveyPgInput = Partial<Omit<AjisSurveyPg, 'idSurvey' | 'userInsert' | 'dateInsert' | 'userUpdate' | 'dateUpdate'>> & {
  idAnak?: string;
};

export interface AjisSurveyPgListResponse {
  data: AjisSurveyPgListItem[];
  total: number;
  page: number;
  limit: number;
}
