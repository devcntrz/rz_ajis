/**
 * types/input-donasi.ts — menu Input Donasi (tab "Input Donasi" saja).
 *
 * Grid membaca langsung dari `ajis_input_donasi` (bukan lewat modul Transaksi).
 * New Single menulis ke tabel yang sama tapi lewat alur legacy InputDonasiBaru:
 * Donatur → Anak → Transaksi, bukan lewat Entry Cashflow.
 */
import type { InputDonasi } from '@/types/transaksi';

export type { InputDonasi };

export interface InputDonasiListResponse {
  data:   InputDonasi[];
  total:  number;
  page:   number;
  limit:  number;
  footer: { total_nominal_donasi: number };
}

/** `Donatur_Options()` — combogrid pertama pada New Single. */
export interface DonaturOption {
  did:          string;
  nama_lengkap: string;
  kantor:       string;
}

/** `Anak_Options()` — anak terpasang pada donatur terpilih, tahun berjalan. */
export interface AnakDonasiOption {
  id_pemasangan_baru:   string;
  id_anak:              string;
  nama_anak:            string;
  nik:                  string;
  id_program:           number;
  program_donasi:       string;
  jenjang_pendidikan:   string;
  jns_kel:              string;
  asnaf:                string;
  kantor_id:            string;
  nama_kantor:          string;
  id_wilayah_pembinaan: string;
  nama_wilayah:         string;
}

/** `Transaksi_Options()` — transaksi milik donatur yang layak dibebani (cicilan). */
export interface TransaksiDonasiOption {
  transid:          string;
  detailid:         number;
  tgl_transaksi:    string;
  perkiraan_rp:     number;
  total_input_donasi: number;
  selisih_donasi:   number;
  nama_program:     string;
  kantor_transaksi: string;
  kantor_donatur:   string;
}

export interface NewSingleDonasiPayload {
  did:                string;
  idAnak:              string;
  idPemasanganBaru:    string;
  idProgram:           string;
  programDonasi:       string;
  kantorId:            string;
  idWilayahPembinaan:  string;
  transid:             string;
  detailid:            number;
  tglTransaksi:        string;
  bulan:               number;
  tahun:               number;
  qty:                 number;
  pilihanDonasi:       number;
}
