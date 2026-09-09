/**
 * lib/surveyPg/fields.ts — column map for `ajis_survey` (Postgres), shared by
 * the GET/POST/PUT handlers so the writable-column whitelist and its
 * camelCase→snake_case mapping live in exactly one place. Mirrors
 * lib/anakPg/fields.ts and lib/userPg/fields.ts.
 *
 * Raw SQL only (CLAUDE.md §2.1) — this is a plain data map, no drizzle import.
 */
import type { AjisSurveyPg, AjisSurveyPgInput } from '@/types/survey-pg';

/**
 * [camelCase field on AjisSurveyPgInput, snake_case column in ajis_survey].
 * Excludes the surrogate `idSurvey` (never writable) and `idAnak` (handled
 * separately — required on create, immutable on update, same as anak-pg's
 * `idAnak`/anak's FK convention).
 *
 * Includes both the bio fields denormalized from ajis_anak at create time
 * (nama_lengkap, kantor_id, ...) and the survey-specific fields — the create
 * route writes both in one INSERT; the update route only ever sends the
 * survey-specific subset from the form, but nothing here prevents a future
 * caller from re-syncing bio fields too.
 */
export const SURVEY_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof AjisSurveyPgInput, string]> = [
  ['tglSurvey', 'tgl_survey'],
  ['petugasSurvey', 'petugas_survey'],

  ['namaLengkap', 'nama_lengkap'],
  ['namaLengkapAyah', 'nama_lengkap_ayah'],
  ['namaLengkapIbu', 'nama_lengkap_ibu'],
  ['namaLengkapWali', 'nama_lengkap_wali'],
  ['kantorId', 'kantor_id'],
  ['namaKantor', 'nama_kantor'],
  ['idWilayahPembinaan', 'id_wilayah_pembinaan'],
  ['namaWilayah', 'nama_wilayah'],
  ['asnaf', 'asnaf'],
  ['alamat', 'alamat'],
  ['namaPropinsi', 'nama_propinsi'],
  ['namaKabupaten', 'nama_kabupaten'],
  ['namaKecamatan', 'nama_kecamatan'],
  ['namaDesa', 'nama_desa'],
  ['jnsKel', 'jns_kel'],
  ['jenjangPendidikan', 'jenjang_pendidikan'],
  ['tglPengajuan', 'tgl_pengajuan'],
  ['statusAnak', 'status_anak'],

  ['hasilKesimpulanSurvey', 'hasil_kesimpulan_survey'],

  ['kepemilikanTanah', 'kepemilikan_tanah'],
  ['kepemilikanRumah', 'kepemilikan_rumah'],
  ['kondisiDindingRumah', 'kondisi_dinding_rumah'],
  ['kondisiLantaiRumah', 'kondisi_lantai_rumah'],
  ['kepemilikanKendaraan', 'kepemilikan_kendaraan'],
  ['kepemilikanBarangElektronik', 'kepemilikan_barang_elektronik'],
  ['kepemilikanTabungan', 'kepemilikan_tabungan'],
  ['pekerjaanKepalaKeluarga', 'pekerjaan_kepala_keluarga'],
  ['rataRataPenghasilanPerbulan', 'rata_rata_penghasilan_perbulan'],
  ['makan2x', 'makan_2x'],
  ['namaKepalaKeluarga', 'nama_kepala_keluarga'],
  ['pendidikanTerakhirKepalaKeluarga', 'pendidikan_terakhir_kepala_keluarga'],
  ['jmlTanggunganKepalaKeluarga', 'jml_tanggungan_kepala_keluarga'],
  ['sumberAirBersih', 'sumber_air_bersih'],
  ['jambanDanSaluranLimbah', 'jamban_dan_saluran_limbah'],
  ['tempatPembuanganSampah', 'tempat_pembuangan_sampah'],
  ['terdapatPerokok', 'terdapat_perokok'],
  ['terdapatKonsumenMiras', 'terdapat_konsumen_miras'],
  ['terdapatPersediaanObatP3k', 'terdapat_persediaan_obat_p3k'],
  ['makanBuahDanSayurTiapHari', 'makan_buah_dan_sayur_tiap_hari'],
  ['shalat5Waktu', 'shalat_5_waktu'],
  ['membacaAlquran', 'membaca_alquran'],
  ['majelisTaklim', 'majelis_taklim'],
  ['membacaKoran', 'membaca_koran'],
  ['aktifSebagaiPengurusOrganisasi', 'aktif_sebagai_pengurus_organisasi'],

  ['asnafAnak', 'asnaf_anak'],
  ['biayaPendidikanSppPerbulan', 'biaya_pendidikan_spp_perbulan'],
  ['bantuanRutinDariLembagaLain', 'bantuan_rutin_dari_lembaga_lain'],
  ['jmlBantuanRutinDariLembagaLain', 'jml_bantuan_rutin_dari_lembaga_lain'],
  ['resumeDeskriptif', 'resume_deskriptif'],
];

/** Survey-specific fields only — excludes the bio fields denormalized from
 *  ajis_anak at create time, which the update route (PUT) never touches. */
export const SURVEY_UPDATABLE_FIELDS: ReadonlyArray<readonly [keyof AjisSurveyPgInput, string]> =
  SURVEY_WRITABLE_FIELDS.filter(([field]) => ![
    'namaLengkap', 'namaLengkapAyah', 'namaLengkapIbu', 'namaLengkapWali',
    'kantorId', 'namaKantor', 'idWilayahPembinaan', 'namaWilayah', 'asnaf',
    'alamat', 'namaPropinsi', 'namaKabupaten', 'namaKecamatan', 'namaDesa',
    'jnsKel', 'jenjangPendidikan', 'tglPengajuan', 'statusAnak',
  ].includes(field as string));

/** Every SELECT column, snake_case, in `s.col` form — full detail view. */
export const SURVEY_DETAIL_COLUMNS = [
  's.id_survey', 's.id_anak',
  ...SURVEY_WRITABLE_FIELDS.map(([, col]) => `s.${col}`),
  's.user_insert', 's.date_insert', 's.user_update', 's.date_update',
].join(', ');

/** Row shape as returned by SURVEY_DETAIL_COLUMNS — snake_case keys. */
export type SurveyPgRow = Record<string, unknown>;

/** snake_case DB row → camelCase AjisSurveyPg-shaped object. */
export function rowToSurveyPg(row: SurveyPgRow): AjisSurveyPg {
  const out: Record<string, unknown> = { idSurvey: row.id_survey, idAnak: row.id_anak };
  for (const [field, col] of SURVEY_WRITABLE_FIELDS) {
    out[field as string] = row[col];
  }
  out.userInsert = row.user_insert ?? null;
  out.dateInsert = row.date_insert ?? null;
  out.userUpdate = row.user_update ?? null;
  out.dateUpdate = row.date_update ?? null;
  return out as unknown as AjisSurveyPg;
}

interface BuildResult {
  columns: string[];
  placeholders: string[];
  values: unknown[];
}

/**
 * Builds the writable column/value lists for an INSERT or UPDATE from a partial
 * body, starting placeholders at `$startIndex`. Unknown keys on the body are
 * silently ignored rather than erroring, mirroring lib/anakPg/fields.ts and
 * lib/userPg/fields.ts.
 */
export function buildWritable(
  body: AjisSurveyPgInput,
  startIndex: number,
  fields: ReadonlyArray<readonly [keyof AjisSurveyPgInput, string]> = SURVEY_WRITABLE_FIELDS,
): BuildResult {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const [field, col] of fields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    columns.push(col);
    values.push((body as Record<string, unknown>)[field as string] ?? null);
  }
  const placeholders = columns.map((_, idx) => `$${startIndex + idx}`);
  return { columns, placeholders, values };
}

/**
 * Builds only the survey-specific (non-denormalized) writable columns — used by
 * the PUT handler, which never re-writes the ajis_anak-sourced bio fields.
 */
export function buildUpdatable(body: AjisSurveyPgInput, startIndex: number): BuildResult {
  return buildWritable(body, startIndex, SURVEY_UPDATABLE_FIELDS);
}
