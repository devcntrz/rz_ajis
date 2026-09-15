/**
 * lib/survey/fields.ts — writable column list for `ajis_survey` (MySQL),
 * shared by the GET/POST/PUT handlers. Mirrors lib/surveyPg/fields.ts, but the
 * MySQL table's columns are already snake_case, so there's no camelCase
 * mapping — this is just the whitelist plus '?'-placeholder INSERT/UPDATE
 * builders (CLAUDE.md §2.1: raw SQL, '?' placeholders).
 */
import type { AjisSurveyInput } from '@/types/survey';

/** Writable columns, excludes the surrogate `id_survey` (never writable) and
 *  `id_anak` (handled separately — required on create, immutable on update). */
export const SURVEY_WRITABLE_FIELDS: ReadonlyArray<keyof AjisSurveyInput> = [
  'tgl_survey', 'petugas_survey',

  'nama_lengkap', 'nama_lengkap_ayah', 'nama_lengkap_ibu', 'nama_lengkap_wali',
  'kantor_id', 'nama_kantor', 'id_wilayah_pembinaan', 'nama_wilayah', 'asnaf', 'alamat',
  'nama_propinsi', 'nama_kabupaten', 'nama_kecamatan', 'nama_desa',
  'jns_kel', 'jenjang_pendidikan', 'tgl_pengajuan', 'status_anak',

  'hasil_kesimpulan_survey',

  'kepemilikan_tanah', 'kepemilikan_rumah', 'kondisi_dinding_rumah', 'kondisi_lantai_rumah',
  'kepemilikan_kendaraan', 'kepemilikan_barang_elektronik', 'kepemilikan_tabungan',
  'pekerjaan_kepala_keluarga', 'rata_rata_penghasilan_perbulan', 'makan_2x',
  'nama_kepala_keluarga', 'pendidikan_terakhir_kepala_keluarga', 'jml_tanggungan_kepala_keluarga',
  'sumber_air_bersih', 'jamban_dan_saluran_limbah', 'tempat_pembuangan_sampah',
  'terdapat_perokok', 'terdapat_konsumen_miras', 'terdapat_persediaan_obat_p3k',
  'makan_buah_dan_sayur_tiap_hari',
  'shalat_5_waktu', 'membaca_alquran', 'majelis_taklim', 'membaca_koran',
  'aktif_sebagai_pengurus_organisasi',

  'asnaf_anak', 'biaya_pendidikan_spp_perbulan', 'bantuan_rutin_dari_lembaga_lain',
  'jml_bantuan_rutin_dari_lembaga_lain', 'resume_deskriptif',
];

/** Bio fields denormalized from ajis_anak (or filled on the form) at create
 *  time — the update route (PUT) never re-writes these. */
const DENORMALIZED_FIELDS: ReadonlySet<string> = new Set([
  'nama_lengkap', 'nama_lengkap_ayah', 'nama_lengkap_ibu', 'nama_lengkap_wali',
  'kantor_id', 'nama_kantor', 'id_wilayah_pembinaan', 'nama_wilayah', 'asnaf', 'alamat',
  'nama_propinsi', 'nama_kabupaten', 'nama_kecamatan', 'nama_desa',
  'jns_kel', 'jenjang_pendidikan', 'tgl_pengajuan', 'status_anak',
]);

export const SURVEY_UPDATABLE_FIELDS: ReadonlyArray<keyof AjisSurveyInput> =
  SURVEY_WRITABLE_FIELDS.filter(f => !DENORMALIZED_FIELDS.has(f as string));

export const SURVEY_DETAIL_COLUMNS =
  ['id_survey', 'id_anak', ...SURVEY_WRITABLE_FIELDS, 'user_insert', 'date_insert', 'user_update', 'date_update'].join(', ');

interface BuildResult {
  columns: string[];
  placeholders: string[];
  values: unknown[];
}

/** Builds the writable column/value lists for an INSERT or UPDATE from a
 *  partial body, using '?' placeholders. Unknown keys are ignored. */
export function buildWritable(
  body: AjisSurveyInput,
  fields: ReadonlyArray<keyof AjisSurveyInput> = SURVEY_WRITABLE_FIELDS,
): BuildResult {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    columns.push(field as string);
    values.push((body as Record<string, unknown>)[field as string] ?? null);
  }
  return { columns, placeholders: columns.map(() => '?'), values };
}

/** Survey-specific columns only — used by PUT, which never re-writes the
 *  denormalized bio fields. */
export function buildUpdatable(body: AjisSurveyInput): BuildResult {
  return buildWritable(body, SURVEY_UPDATABLE_FIELDS);
}
