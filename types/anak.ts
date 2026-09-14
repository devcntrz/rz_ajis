/** types/anak.ts — matches real ajis_anak table */
export interface Anak {
  id_anak:              string;
  nik:                  string;
  nama_lengkap:         string;
  nama_panggilan:       string;
  agama:                string;
  jns_kel:              'l' | 'p';
  tempat_lahir:         string;
  tgl_lahir:            string;
  jenjang_pendidikan:   string;
  kelas:                string;
  nama_sekolah:         string;
  asnaf:                string;
  status_ortu:          string;
  status_tersantuni:    'su' | 'b' | 'se' | 't';
  id_wilayah_pembinaan: number;
  kantor_id:            string;
  nama_wilayah:         string;
  nama_kantor:          string;
  tgl_terdaftar:        string;
  foto:                 string;
  aktif:                'y' | 'n';
  // Parent data
  nama_lengkap_ayah?:   string;
  nama_lengkap_ibu?:    string;
  nama_lengkap_wali?:   string;
  telp_yang_bisa_dihubungi?: string;
  alamat?:              string;
}

/** Full record as returned by GET /api/anakjuara/anak/[id] — all ajis_anak columns used by the app. */
export interface AnakDetail {
  id_anak:              string;
  nik:                  string;
  nama_lengkap:         string;
  nama_panggilan:       string;
  agama:                string;
  jns_kel:              'l' | 'p';
  tempat_lahir:         string;
  tgl_lahir:            string;
  anak_ke:              string;
  dari_saudara:         string;
  alamat:               string;
  jenjang_pendidikan:   string;
  kelas:                string;
  nama_sekolah:         string;
  alamat_sekolah:       string;
  // Perguruan Tinggi (jenjang_pendidikan = PT) — separate columns, not reused from kelas/nama_sekolah.
  jurusan:              string;
  semester:             number | null;
  nama_pt:              string;
  alamat_pt:            string;
  nilai:                string;
  pelajaran_favorit:    string;
  jarak_rumah:          string;
  alat_transportasi:    string;
  no_kartu_keluarga:    string;
  asnaf:                string;
  status_ortu:          string;
  status_tersantuni:    'su' | 'b' | 'se' | 't';
  status_survey:        'y' | 'n';
  status_kelayakan:     'y' | 'n';
  status_anak_juara:    string;
  status_pinjam:        'y' | 'n';
  status_mentor:        'y' | 'n';
  id_wilayah_pembinaan: number;
  kantor_id:            string;
  nama_wilayah:         string;
  nama_kantor:          string;
  tgl_terdaftar:        string;
  tgl_pengajuan:        string | null;
  foto:                 string;
  hobi:                 string;
  prestasi:             string;
  aktif:                'y' | 'n';
  tinggal_bersama:      string;
  nama_tinggal:         string;
  ket_tinggal:          string;
  penghasilan_tinggal:  string;
  pekerjaan_tinggal:    string;
  tidak_serumah_ortu:   string;
  nama_lengkap_ayah:    string;
  pekerjaan_ayah:       string;
  penghasilan_rata_rata_ayah: string;
  tanggal_kematian_ayah: string | null;
  penyebab_kematian_ayah: string;
  nama_lengkap_ibu:     string;
  pekerjaan_ibu:        string;
  penghasilan_rata_rata_ibu: string;
  tanggal_kematian_ibu: string | null;
  penyebab_kematian_ibu: string;
  nama_lengkap_wali:    string;
  pekerjaan_wali:       string;
  penghasilan_rata_rata_wali: string;
  telp_yang_bisa_dihubungi: string;
  atas_nama:            string;
  hubungan_kerabat:     string;
  no_rekening:          string;
  nama_bank:            string;
  pemilik_rekening:     string;
  id_sdm:               string;
  nama_mentor:          string;
  alumni_juara:         '' | 'y' | 'n';
  juara:                string;
}

/** Body accepted by PATCH /api/anakjuara/anak/[id] — every field optional (partial update). */
export type AnakUpdateInput = Partial<Omit<AnakDetail, 'id_anak' | 'nama_wilayah' | 'nama_kantor'>>;

export type AnakListSource = 'anak' | 'pemasangan';

export interface AnakListParams {
  wilayah?:    string;
  status_ortu?: string;
  jenjang?:    string;
  asnaf?:      string;
  q?:          string;
  page?:       string;
  limit?:      string;
  source?:     AnakListSource;
  id_sdm?:     string;
}

export interface AnakListRow {
  id_anak:              string;
  nama_lengkap:         string;
  nama_panggilan:       string;
  jns_kel:              'l' | 'p';
  jenjang_pendidikan:   string;
  kelas:                string;
  nama_sekolah:         string;
  asnaf:                string;
  status_ortu:          string;
  id_wilayah_pembinaan: number;
  nama_wilayah:         string;
  nama_kantor:          string;
  tgl_lahir:            string;
  tgl_terdaftar:        string;
  foto:                 string;
  telp_yang_bisa_dihubungi?: string;
}
