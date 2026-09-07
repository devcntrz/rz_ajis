/**
 * types/penyaluran.ts — menu Penyaluran (tab Wilayah + tab Anak).
 */

export type Periode = 'ganjil' | 'genap';

/** Satu baris grid tab Wilayah = satu batch (`id_penyaluran`), hasil agregat. */
export interface PenyaluranBatch {
  id_penyaluran:        string;
  id_kantor:            string;
  nama_kantor:          string;
  id_wilayah_pembinaan: string;
  nama_wilayah:         string;
  bulan:                string;
  tahun:                string;
  periode:              string;
  status_akhir:         string | null;
  tgl_penyaluran:       string | null;
  id_sdm:               string | null;
  nama_sdm:             string | null;
  jumlah_anak:          number;
  jumlah_penyaluran:    number;
  jumlah_hpp:            number;
  jumlah_sd:             number;
  jumlah_smp:             number;
  jumlah_sma:             number;
  jumlah_pt:              number;
}

/** Satu baris di dalam batch (detail / tab Anak). */
export interface PenyaluranRow {
  id_row:               number;
  id_penyaluran:        string;
  id_pemasangan_baru:   string;
  id_anak:              string;
  nama_anak:            string;
  nik:                  string;
  jenjang_pendidikan:   string;
  kelas:                string;
  jns_kel:              string;
  asnaf:                string;
  id_donatur:           string;
  nama_donatur:         string;
  id_kantor:            string;
  nama_kantor:          string;
  id_wilayah_pembinaan: string;
  nama_wilayah:         string;
  program_donasi:       string;
  nominal_penyaluran:   number;
  nominal_hpp:           number;
  bulan:                string;
  tahun:                string;
  periode:              string;
  via_input:            string;
  tgl_penyaluran:       string | null;
  no_rekening:          string;
  nama_bank:            string;
  pemilik_rekening:     string;
}

/** Anak layak salur — dipakai bersama New Bulk preview & New Single combogrid. */
export interface KandidatSalur {
  id_pemasangan_baru:   string;
  id_anak:              string;
  nama_anak:            string;
  nik:                  string;
  jenjang_pendidikan:   string;
  kelas:                string;
  jns_kel:              string;
  asnaf:                string;
  id_donatur:           string;
  nama_donatur:         string;
  id_wilayah_pembinaan: string;
  nama_wilayah:         string;
  kantor_id:            string;
  nama_kantor:          string;
  program_donasi:       string;
  id_program:           number;
  harga_program:        number;
  harga_penyaluran:     number;
  no_rekening:          string;
  nama_bank:            string;
  pemilik_rekening:     string;
  saldo_awal:           number;
  donasi:               number;
  tersalurkan:          number;
  saldo_akhir:          number;
}

export interface NewBulkPayload {
  kantorId:            string;
  wilayahId:            string;
  bulan:               number;
  tahun:               number;
}

export interface NewBulkResult {
  id_penyaluran: string;
  jumlah_anak:   number;
  dilewati:      number;
}

export interface EditRowPayload {
  nominalPenyaluran?: number;
  nominalHpp?:        number;
  bulan?:             number;
  tahun?:             number;
  alasan:             string;
}

export interface TeknisPayload {
  idPenyaluranBaru?: string;
  tglPenyaluran:      string;
  idSdm:              string;
}

export interface KantorOption { oid: string; kantor: string; }
export interface WilayahOption { id_wilayah_pembinaan: number; nama_wilayah: string; kantor_id: string; }
export interface SdmOption { id_sdm: string; nama_lengkap: string; }
