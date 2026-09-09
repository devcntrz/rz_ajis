/**
 * lib/anakPg/fields.ts — column map for `ajis_anak` (Postgres), shared by the
 * POST (create) and PUT (update) handlers so the writable-column whitelist and its
 * camelCase→snake_case mapping live in exactly one place.
 *
 * Raw SQL only (PRD §2.1 rule 1) — this is a plain data map, no drizzle import.
 */
import type { AnakPgInput } from '@/types/anak-pg';

/** [camelCase field on AnakPgInput, snake_case column in ajis_anak]. Excludes the
 *  surrogate `id` (never writable) and `idAnak` (handled separately — required on
 *  create, immutable on update since every other table's FK points at it). */
export const ANAK_WRITABLE_FIELDS: ReadonlyArray<readonly [keyof AnakPgInput, string]> = [
  ['nik', 'nik'],
  ['namaLengkap', 'nama_lengkap'],
  ['namaPanggilan', 'nama_panggilan'],
  ['agama', 'agama'],
  ['jnsKel', 'jns_kel'],
  ['tempatLahir', 'tempat_lahir'],
  ['tglLahir', 'tgl_lahir'],
  ['anakKe', 'anak_ke'],
  ['dariSaudara', 'dari_saudara'],

  ['alamat', 'alamat'],
  ['propid', 'propid'],
  ['namaPropinsi', 'nama_propinsi'],
  ['kabid', 'kabid'],
  ['namaKabupaten', 'nama_kabupaten'],
  ['camatid', 'camatid'],
  ['namaKecamatan', 'nama_kecamatan'],
  ['desaid', 'desaid'],
  ['namaDesa', 'nama_desa'],

  ['jenjangPendidikan', 'jenjang_pendidikan'],
  ['kelas', 'kelas'],
  ['namaSekolah', 'nama_sekolah'],
  ['alamatSekolah', 'alamat_sekolah'],
  ['jurusan', 'jurusan'],
  ['semester', 'semester'],
  ['namaPt', 'nama_pt'],
  ['alamatPt', 'alamat_pt'],
  ['nilai', 'nilai'],
  ['pelajaranFavorit', 'pelajaran_favorit'],
  ['jarakRumah', 'jarak_rumah'],
  ['alatTransportasi', 'alat_transportasi'],
  ['hobi', 'hobi'],
  ['prestasi', 'prestasi'],

  ['noRekening', 'no_rekening'],
  ['pemilikRekening', 'pemilik_rekening'],
  ['namaBank', 'nama_bank'],

  ['foto', 'foto'],
  ['noKartuKeluarga', 'no_kartu_keluarga'],
  ['asnaf', 'asnaf'],
  ['statusOrtu', 'status_ortu'],

  ['statusSurvey', 'status_survey'],
  ['statusKelayakan', 'status_kelayakan'],
  ['statusAnakJuara', 'status_anak_juara'],
  ['statusTersantuni', 'status_tersantuni'],
  ['statusPinjam', 'status_pinjam'],
  ['statusMentor', 'status_mentor'],
  ['aktif', 'aktif'],
  ['alumniJuara', 'alumni_juara'],
  ['juara', 'juara'],
  ['approvalIjf', 'approval_ijf'],
  ['viaInput', 'via_input'],

  ['idWilayahPembinaan', 'id_wilayah_pembinaan'],
  ['namaWilayah', 'nama_wilayah'],
  ['kantorId', 'kantor_id'],
  ['namaKantor', 'nama_kantor'],
  ['idSdm', 'id_sdm'],
  ['namaMentor', 'nama_mentor'],

  ['tglTerdaftar', 'tgl_terdaftar'],
  ['tglPengajuan', 'tgl_pengajuan'],

  ['namaLengkapAyah', 'nama_lengkap_ayah'],
  ['alamatAyah', 'alamat_ayah'],
  ['propidAyah', 'propid_ayah'],
  ['namaPropinsiAyah', 'nama_propinsi_ayah'],
  ['kabidAyah', 'kabid_ayah'],
  ['namaKabupatenAyah', 'nama_kabupaten_ayah'],
  ['camatidAyah', 'camatid_ayah'],
  ['namaKecamatanAyah', 'nama_kecamatan_ayah'],
  ['desaidAyah', 'desaid_ayah'],
  ['namaDesaAyah', 'nama_desa_ayah'],
  ['pekerjaanAyah', 'pekerjaan_ayah'],
  ['penghasilanRataRataAyah', 'penghasilan_rata_rata_ayah'],
  ['tanggalKematianAyah', 'tanggal_kematian_ayah'],
  ['penyebabKematianAyah', 'penyebab_kematian_ayah'],

  ['namaLengkapIbu', 'nama_lengkap_ibu'],
  ['alamatIbu', 'alamat_ibu'],
  ['propidIbu', 'propid_ibu'],
  ['namaPropinsiIbu', 'nama_propinsi_ibu'],
  ['kabidIbu', 'kabid_ibu'],
  ['namaKabupatenIbu', 'nama_kabupaten_ibu'],
  ['camatidIbu', 'camatid_ibu'],
  ['namaKecamatanIbu', 'nama_kecamatan_ibu'],
  ['desaidIbu', 'desaid_ibu'],
  ['namaDesaIbu', 'nama_desa_ibu'],
  ['pekerjaanIbu', 'pekerjaan_ibu'],
  ['penghasilanRataRataIbu', 'penghasilan_rata_rata_ibu'],
  ['tanggalKematianIbu', 'tanggal_kematian_ibu'],
  ['penyebabKematianIbu', 'penyebab_kematian_ibu'],

  ['namaLengkapWali', 'nama_lengkap_wali'],
  ['alamatWali', 'alamat_wali'],
  ['propidWali', 'propid_wali'],
  ['namaPropinsiWali', 'nama_propinsi_wali'],
  ['kabidWali', 'kabid_wali'],
  ['namaKabupatenWali', 'nama_kabupaten_wali'],
  ['camatidWali', 'camatid_wali'],
  ['namaKecamatanWali', 'nama_kecamatan_wali'],
  ['desaidWali', 'desaid_wali'],
  ['namaDesaWali', 'nama_desa_wali'],
  ['pekerjaanWali', 'pekerjaan_wali'],
  ['penghasilanRataRataWali', 'penghasilan_rata_rata_wali'],

  ['telpYangBisaDihubungi', 'telp_yang_bisa_dihubungi'],
  ['atasNama', 'atas_nama'],
  ['hubunganKerabat', 'hubungan_kerabat'],

  ['tinggalBersama', 'tinggal_bersama'],
  ['namaTinggal', 'nama_tinggal'],
  ['ketTinggal', 'ket_tinggal'],
  ['penghasilanTinggal', 'penghasilan_tinggal'],
  ['pekerjaanTinggal', 'pekerjaan_tinggal'],
  ['tidakSerumahOrtu', 'tidak_serumah_ortu'],

  ['niaRfoBook', 'nia_rfo_book'],
  ['namaRfoBook', 'nama_rfo_book'],
  ['tglPeminjaman', 'tgl_peminjaman'],
  ['tglExpired', 'tgl_expired'],
  ['bookVia', 'book_via'],
  ['userBook', 'user_book'],
];

/** Every SELECT column, snake_case, in `a.col` form — full detail view. */
export const ANAK_DETAIL_COLUMNS = [
  'a.id', 'a.id_anak',
  ...ANAK_WRITABLE_FIELDS.map(([, col]) => `a.${col}`),
  'a.external_ids',
].join(', ');

/** Row shape as returned by `SELECT *` / ANAK_DETAIL_COLUMNS — snake_case keys. */
export type AnakPgRow = Record<string, unknown>;

/** snake_case DB row → camelCase AnakPg-shaped object. */
export function rowToAnakPg(row: AnakPgRow): Record<string, unknown> {
  const out: Record<string, unknown> = { id: row.id, idAnak: row.id_anak };
  for (const [field, col] of ANAK_WRITABLE_FIELDS) {
    out[field as string] = row[col];
  }
  out.externalIds = row.external_ids;
  return out;
}

interface BuildResult {
  columns: string[];
  placeholders: string[];
  values: unknown[];
}

/**
 * Builds the writable column/value lists for an INSERT or UPDATE from a partial
 * body, starting placeholders at `$startIndex`. Unknown keys on the body are
 * silently ignored (not part of ANAK_WRITABLE_FIELDS) rather than erroring, since
 * the caller only ever passes JSON already shaped by the client form.
 */
export function buildWritable(body: AnakPgInput, startIndex: number): BuildResult {
  const columns: string[] = [];
  const values: unknown[] = [];
  let i = startIndex;
  for (const [field, col] of ANAK_WRITABLE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    columns.push(col);
    values.push((body as Record<string, unknown>)[field as string] ?? null);
    i += 1;
  }
  const placeholders = columns.map((_, idx) => `$${startIndex + idx}`);
  void i;
  return { columns, placeholders, values };
}
