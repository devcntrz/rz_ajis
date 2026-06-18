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
