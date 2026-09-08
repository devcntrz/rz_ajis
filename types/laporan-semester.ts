/**
 * types/laporan-semester.ts — Laporan Semester (Lapsem/Rekap) types.
 *
 * `manual_laporan` is a wide, denormalized legacy table (~50+ columns); this row
 * shape carries the subset actually rendered by the Lapsem grid, ported from
 * `LaporanPembinaanBaruClass::LaporanPembinaanBaru_Read()`. The PDF assembler
 * (lib/laporanSemester/pdf.ts) queries additional columns directly when building
 * the preview HTML, so it does not need every field surfaced here.
 */
export interface LapsemRow {
  laporanid:          string;
  id_anak:            string;
  nama_lengkap:       string;
  pm_nama_lengkap:    string;
  jns_kel:            string;
  oid:                string;
  nama_kantor:        string;
  id_wilayah_pembinaan: string;
  nama_wilayah:       string;
  semesterid:         string;
  nama_semester:      string;
  programid:          string;
  nama_program:       string;
  donatur_id:         string;
  donatur_nama:       string;
  dana_saldo_awal_view: number | null;
  dana_penerimaan_view: number | null;
  dana_penyaluran_view: number | null;
  status_terbuat:     string | null;
  jml_materi:         number | null;
  id_program_postgree: string | null;
  tgl_insert:         string | null;
}

export interface LapsemListParams {
  page?:        number;
  limit?:       number;
  q?:           string;
  kantor_id?:   string;
  id_wilayah_pembinaan?: string;
  semesterid?:  string;
  keyjenjang?:  string;
  key_approve?: 'ya' | 'tidak' | '';
}

/**
 * Per-kantor aggregate row, ported from `RekapTerbuat()` — consolidated from ~14
 * separate COUNT queries per office into one conditional-SUM query
 * (lib/laporanSemester/queries.ts#fetchRekapByKantor).
 */
/** Assembled data for one Lapsem PDF — everything `lib/pdf/lapsemTemplate.ts` needs. */
export interface ManualLaporanProfil {
  laporanid:        string;
  id_anak:          string;
  nama:             string;
  jns_kel:          string;
  tempat_lahir:     string;
  tgl_lahir:        string;
  anak_ke:          string;
  saudara:          string;
  nama_ortu:        string;
  pekerjaan:        string;
  sekolah:          string;
  alamat_sekolah:   string;
  kelas:            string;
  jenjang:          string;
  institusi:        string;
  prodi:            string;
  mhs_semester:     string;
  jurusan:          string;
  foto:             string | null;
  foto_pembinaan:   string | null;
  programid:        string;
  nama_program:     string;
  donatur_nama:     string;
  donatur_alamat:   string;
  kantor:           string;
  wilayah:          string;
  kota:             string;
  tgl_hari_ini:     string;
  nama_semester:    string;
}

export interface ManualLaporanKeuangan {
  saldo_awal:     number;
  penerimaan:     number;
  penyaluran:     number;
  jml_penerimaan: number;
  saldo_akhir:    number;
}

export interface ManualLaporanPembinaanRow {
  tgl_pembinaan: string;
  judul_materi:  string;
  tgl_penyaluran: string | null;
}

export interface ManualLaporanAspekRow {
  aspek:                string;
  target:               string;
  kondisi_awal:         string;
  nilai_capaian:        number | null;
  perkembangan_capaian: string;
  skor:                 number | null;
  hasil_akhir:          string;
}

export interface ManualLaporanPrestasiRow {
  prestasi: string;
  tahun:    string | null;
}

export interface ManualLaporanData {
  profil:            ManualLaporanProfil;
  keuangan:          ManualLaporanKeuangan;
  pembinaan:         ManualLaporanPembinaanRow[];
  pembinaanPerkembangan: string | null;
  aspekCerdas:       ManualLaporanAspekRow[];
  aspekMandiri:      ManualLaporanAspekRow[];
  aspekKompetitif:   ManualLaporanAspekRow[];
  prestasi:          ManualLaporanPrestasiRow[];
  skorMandiriTotal:  number;
  skorMandiriRata:   number;
  skorMandiriNilai:  string;
  suaraAnakJuara:    string;
  catatanPembinaan:  string;
  gambarDokumentasi: string | null;
  template:          Record<string, string | null>;
}

export interface RekapKantorRow {
  oid:                  string;
  kantor:               string;
  jml_laporan:          number;
  persentase:           number;
  jml_status_terbuat:   number;
  jml_foto:             number;
  jml_foto_pembinaan:   number;
  jml_raport_ceria:     number;
  jml_raport_satu:      number;
  jml_raport_dua:       number;
  jml_surat_suara_hati: number;
  jml_dana_saldo_awal:  number;
  jml_dana_penerimaan:  number;
  jml_dana_penyaluran:  number;
  jml_materi:           number;
}
