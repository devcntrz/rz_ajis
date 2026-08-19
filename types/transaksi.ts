/**
 * types/transaksi.ts — Modul Transaksi.
 *
 * One `transaksi` row is identified by the composite key (transid, detailid) — never
 * by transid alone. It is split across N children into `ajis_input_donasi`, and the
 * sum of those splits must equal `perkiraan_rp` exactly.
 */

export type YN = 'y' | 'n';
export type Periode = 'ganjil' | 'genap';

/** Grid tabs. Each maps to a different fixed WHERE base, not just a filter. */
export type TransaksiScope = 'main' | 'review' | 'cicilan' | 'unidentified';

/** Columns the grid and detail view actually read. Never `SELECT *`. */
export interface Transaksi {
  transid:            string;
  detailid:           number;
  jenis_transaksi:    string;
  did:                string;
  nama_donatur:       string;
  progid:             string;
  id_program:         number;
  nama_program:       string;
  harga_program:      number;
  perkiraan_rp:       number;
  tgl_donasi:         string;
  tgl_transaksi:      string;
  oid_transaksi:      string;
  kantor_transaksi:   string;
  oid_donatur:        string;
  kantor_donatur:     string;
  jml_mustahik:       string;
  bulan_disantuni:    string;
  keterangan:         string;
  atas_nama:          string;
  review:             YN;
  approve_salur:      YN | '';
  ket_approve_salur:  string;
  user_approve_salur: string;
  bulan_salur:        string;
  tahun_salur:        string;
  cicilan:            YN;
  status_pasang:      YN;
  total_input_donasi: number;
  selisih_donasi:     number;
  jml_anak_ijis:      number;
  kantor_ijis:        string;
  id_kantor_ijis:     string;
  id_review:          string;
  user_insert_cf:     string;
  user_update_cf:     string;
}

/** A saved split row (`ajis_input_donasi`), as returned by GET .../entries. */
export interface InputDonasi {
  id_input_donasi:      number;
  id_pemasangan_baru:   string;
  transid:              string;
  detailid:             number;
  id_anak:              string;
  nama_anak:            string;
  nik:                  string;
  id_donatur:           string;
  nama_donatur:         string;
  program_donasi:       string;
  id_program:           string;
  pilihan_donasi:       number;
  qty:                  number;
  nominal_donasi:       number;
  bulan:                string;
  tahun:                string;
  periode:              string;
  jenis:                string;
  via_input:            string;
  kantor_id:            string;
  nama_kantor:          string;
  id_wilayah_pembinaan: string;
  nama_wilayah:         string;
  jenjang_pendidikan:   string;
  jns_kel:              string;
  asnaf:                string;
  tgl_transaksi:        string;
}

/**
 * A child eligible to receive part of this transaction — an active pairing of the
 * transaction's donor. `pilihan_donasi`/`nominal_donasi` are precomputed server-side
 * so the form does not have to know the program price.
 */
export interface AnakKandidat {
  id_pemasangan_baru:   string;
  id_anak:              string;
  nama_anak:            string;
  nik:                  string;
  id_donatur:           string;
  program_donasi:       string;
  id_program:           number;
  jenjang_pendidikan:   string;
  jns_kel:              string;
  asnaf:                string;
  kantor_id:            string;
  nama_kantor:          string;
  id_wilayah_pembinaan: string;
  nama_wilayah:         string;
  pilihan_donasi:       number;
  qty:                  number;
  nominal_donasi:       number;
}

/** One row of the Entry/Update Cashflow payload (PUT .../entries). */
export interface EntryRow {
  id_anak:              string;
  id_pemasangan_baru:   string;
  id_program:           string;
  program_donasi:       string;
  kantor_id:            string;
  id_wilayah_pembinaan: string;
  pilihan_donasi:       number;
  qty:                  number;
  nominal_donasi:       number;
}

/** Shape of the list endpoint's response envelope. */
export interface TransaksiListResponse {
  data:   Transaksi[];
  total:  number;
  page:   number;
  limit:  number;
  footer: { total_perkiraan_rp: number };
}

export interface ProgramOption {
  id_program:    number;
  progid:        string;
  nama_program:  string;
  harga_program: number;
}

export interface KantorOption {
  oid:    string;
  kantor: string;
}
