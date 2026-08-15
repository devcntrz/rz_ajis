/** types/ajuan.ts — ajis_view_ajuan request store (Ajuan Ganti Anak) */

export type ApproveFunding = 't' | 'y' | 'n';
export type StatusEksekusi = '' | 'y' | 'n';
export type TipeGanti = 'anak_existing' | 'pemasangan_baru';

export interface AjuanGantiAnak {
  id_ajuan:               number;
  tgl_ajuan:              string;
  id_pemasangan_baru:     string | null;
  id_kantor:              string;
  nama_kantor:            string;
  id_wilayah_pembinaan:   string;
  nama_wilayah:           string;
  id_donatur:             string;
  oid_donatur:            string;
  kantor_donatur:         string;
  nama_donatur:           string;
  jenis_kelamin_donatur:  string;
  program_donasi:         string;
  nia_rfo:                string;
  nama_rfo:               string;
  id_anak:                string;
  nama_anak_asal:         string;
  jns_kelamin:            string;
  alasan_pergantian:      string;
  id_anak_pengganti:      string;
  nama_anak_pengganti:    string;
  keterangan:             string;
  tipe_ganti:             TipeGanti | string;
  pindah_saldo:           number;
  approve_funding:        ApproveFunding;
  status_eksekusi:        StatusEksekusi;
  tgl_eksekusi:           string | null;
  tgl_approve_funding:    string | null;
  jcustid:                string;
  jenis_donatur:          string;
  hp:                     string;
  alasan_reject:          string;
}

export interface AjuanListParams {
  kantor_id?:       string;
  bulan?:           string;
  tahun?:           string;
  approve_funding?: ApproveFunding | '';
  status_eksekusi?: 'y' | 'n' | '';
  q?:               string;
  page?:            string | number;
  limit?:           string | number;
}

/**
 * Donor extras (oid_donatur, kantor_donatur, jenis_donatur, hp, jenis_kelamin,
 * jcustid) are deliberately absent: the POST handler reads them from `donatur`
 * via lib/donatur so they cannot be forged client-side.
 */
export interface CreateAjuanPayload {
  id_pemasangan_baru:    string;
  id_kantor:             string;
  nama_kantor:           string;
  id_wilayah_pembinaan:  string;
  nama_wilayah:          string;
  id_donatur:            string;
  nama_donatur:          string;
  program_donasi:        string;
  nia_rfo:               string;
  nama_rfo:              string;
  id_anak_asal:          string;
  nama_anak_asal:        string;
  jns_kelamin?:          string;
  alasan_pergantian:     string;
  id_anak_pengganti:     string;
  nama_anak_pengganti:   string;
  tipe_ganti:            TipeGanti;
  keterangan?:           string;
  pindah_saldo?:         number;
}

export interface EksekusiPayload {
  keterangan_pemberhentian: string;
  saldo_akhir_ganti:        number;
  saldo_awal_ganjil?:       number;
  saldo_akhir_ganjil?:      number;
  saldo_awal_genap?:        number;
  saldo_akhir_genap?:       number;
  id_input_donasi?:         number[];
}

export interface DonasiPindahRow {
  id_input_donasi:    number;
  id_pemasangan_baru: string;
  id_anak:            string;
  id_donatur:         string;
  program_donasi:     string;
  nominal_donasi:     number;
  bulan:              string;
  tahun:              string;
  tgl_transaksi:      string;
  transid:            string;
  detailid:           number;
  qty:                number;
  jenis:              string;
}
