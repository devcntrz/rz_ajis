/** types/anak-juara.ts — pairing rows from ajis_pemasangan (Anak Juara list) */

export interface AnakJuaraRow {
  id_pemasangan_baru:           string;
  tahun:                        string;
  id_anak:                      string;
  nama_anak:                    string;
  id_donatur:                   string;
  nama_donatur:                 string;
  program_donasi:               string;
  id_program:                   number;
  id_kantor:                    string;
  nama_kantor:                  string;
  id_wilayah_pembinaan:         string;
  nama_wilayah:                 string;
  status_pasangan:              'y' | 'n';
  tgl_pemasangan:               string;
  tgl_pemberhentian_pemasangan: string | null;
  keterangan_pemberhentian:     string;
  via_input:                    string;
  user_insert:                  string;
  via_stop:                     string;
  user_stop:                    string;
  no_rekening:                  string;
  tunda_penyaluran:             string;
  nia_rfo:                      string;
  nama_rfo:                     string;
  jns_kel:                      string;
  jenjang_pendidikan:           string;
  asnaf:                        string;
  status_ortu:                  string;
  kelas:                        string;
  nik:                          string;
  jcustid:                      number;
}

export interface AnakJuaraListParams {
  tahun?:           string;
  kantor_id?:       string;
  wilayah?:         string;
  status_pasangan?: string;
  q?:               string;
  page?:            string | number;
  limit?:           string | number;
}

export interface AnakPenggantiOption {
  value:     string;
  label:     string;
  id_anak:   string;
  nama_anak: string;
}
