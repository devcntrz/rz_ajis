/**
 * types/penilaian.ts
 * Based on REAL ajis_penilaian table structure:
 * - PK = (id_anak, semesterid, aspek)
 * - aspek = category name string (e.g. "Aspek Cerdas", "Aspek Mandiri")
 * - skor = numeric score (nilai_capaian)
 * - hasil_akhir = text grade
 * - kondisi_awal = baseline text
 * - perkembangan_capaian = progress text
 * - target = target text
 */

export type NilaiHuruf = 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';

/** One row from ajis_penilaian (one per aspek category per child per semester) */
export interface PenilaianRow {
  id_anak:               string;
  nama_anak:             string;
  nama_kantor:           string;
  nama_wilayah:          string;
  kantor_id:             string;
  id_wilayah_pembinaan:  string;
  tgl_insert:            string;
  semesterid:            string;
  kategori:              string;
  aspek:                 string;   // category name = PK component
  target:                string;
  kondisi_awal:          string;
  nilai_capaian:         number;
  perkembangan_capaian:  string;
  skor:                  number;
  hasil_akhir:           string;   // text grade: Excellent/Good/etc
  keterangan:            string;
  via_input:             string;
  id_item_penilaian:     number;
}

/** Aspek items for display in LaporanCard */
export interface AspekCerdas {
  aspek:                string;   // e.g. "Hafalan Alquran"
  target:               string;
  kondisi_awal:         string;
  perkembangan_capaian: string;
  hasil_akhir:          NilaiHuruf | string;
  id_item_penilaian:    number;
}

export interface AspekMandiri {
  aspek:             string;   // e.g. "Kehadiran Pembinaan"
  target:            string;
  nilai_capaian:     number;
  hasil_akhir:       NilaiHuruf | string;
  id_item_penilaian: number;
}

/** Aggregated penilaian for a child+semester (for list view) */
export interface PenilaianSummary {
  id_anak:    string;
  nama_anak:  string;
  semesterid: string;
  tgl_insert: string;
  has_data:   boolean;
  aspek_cerdas:  AspekCerdas[];
  aspek_mandiri: AspekMandiri[];
  catatan:    string;   // from aspek='Catatan Pembinaan'
  suara_anak: string;   // from aspek='Suara Anak Juara'
}

/** The 9 standard aspek items (matching real data) */
export const ASPEK_CERDAS_ITEMS = [
  { aspek: 'Kemampuan Membaca Alquran', target: 'Al Quran Lancar', id: 1 },
  { aspek: 'Hafalan Alquran',           target: 'Level 4 (Juz 30)', id: 2 },
  { aspek: 'Hafalan Bacaan Shalat',     target: '10 Bacaan',        id: 3 },
  { aspek: 'Hafalan Doa Pilihan',       target: '14 Doa',           id: 4 },
] as const;

export const ASPEK_MANDIRI_ITEMS = [
  { aspek: 'Kehadiran Pembinaan',    id: 5 },
  { aspek: 'Pembiasaan Sedekah',     id: 7 },
  { aspek: 'Pembiasaan Tilawah',     id: 8 },
  { aspek: 'Membantu Orangtua',      id: 9 },
  { aspek: 'Pembiasaan Shalat Wajib',id: 6 },
] as const;
