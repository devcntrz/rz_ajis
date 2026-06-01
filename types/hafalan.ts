/**
 * types/hafalan.ts
 * Based on REAL ajis_hafalan table:
 * - id_anak, jenis, konten_uji, tgl_pengujian, semesterid
 * Master items from ajis_item_hafalan: id, jenis, konten
 * jenis: 2=Quran, 3=Shalat, 4=Doa
 */

/** Master hafalan item from ajis_item_hafalan */
export interface HafalanItem {
  id:     number;
  jenis:  2 | 3 | 4;
  konten: string;
  selesai?: boolean;  // computed: exists in ajis_hafalan for this anak+semester
}

/** Record from ajis_hafalan table */
export interface HafalanRecord {
  id_anak:        string;
  jenis:          string;
  konten_uji:     string;
  tgl_pengujian:  string;
  tgl_insert:     string;
  keterangan:     string;
  semesterid:     string;
}

export const JENIS_LABEL: Record<number, string> = {
  2: 'Al-Quran',
  3: 'Bacaan Shalat',
  4: 'Doa Pilihan',
};
