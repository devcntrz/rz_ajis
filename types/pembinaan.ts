/**
 * types/pembinaan.ts
 * Based on REAL ajis_pembinaan_baru table structure:
 * - One row per CHILD per SESSION (shared id_pembinaan)
 * - kehadiran = 'y' (hadir) | 'n' (tidak hadir)
 * - keterangan = izin/alfa reason
 * - Mandiri stored as int columns: membantu_ortu, pembiasaan_shalat_wajib,
 *   pembiasaan_tilawah, pembiasaan_sedekah
 */

/** One session row (grouped from multiple child rows via id_pembinaan) */
export interface Pembinaan {
  id_pembinaan:        string;
  tgl_pembinaan:       string;
  semesterid:          string;
  bulan:               string;
  tahun:               string;
  jenis_pembinaan:     string;
  judul_materi:        string;   // tema/judul
  pemateri:            string;
  kantor_id:           string;
  nama_kantor:         string;
  nama_wilayah:        string;
  id_wilayah_pembinaan: string;
  // Aggregated counts from GROUP BY
  jumlah_anak:         number;
  jumlah_hadir:        number;
  jumlah_tidak_hadir:  number;
}

/** One child's attendance row (raw from ajis_pembinaan_baru) */
export interface PembinaanAnakRow {
  id_row:                   number;
  id_pembinaan:             string;
  id_anak:                  string;
  nama_lengkap:             string;
  jenjang_pendidikan:       string;
  status_ortu:              string;
  jns_kel:                  string;
  kehadiran:                'y' | 'n';
  keterangan:               string;
  pembiasaan_shalat_wajib:  number; // 1=yes, 0=no
  pembiasaan_tilawah:       number;
  pembiasaan_sedekah:       number;
  membantu_ortu:            number;
}

/** Mandiri data per child per session */
export interface Mandiri {
  shalat_wajib: boolean;
  tilawah:      boolean;
  sedekah:      boolean;
  bantu_ortu:   boolean;
}

/** For creating/updating a session (POST/PUT) */
export interface PembinaanFormData {
  tgl_pembinaan:       string;
  semesterid:          string;
  jenis_pembinaan:     string;
  judul_materi:        string;
  pemateri:            string;
  kehadiran:           Record<string, 'y' | 'n'>;   // anakId → 'y'|'n'
  keterangan:          Record<string, string>;       // anakId → reason
  mandiri:             Record<string, Mandiri>;       // anakId → mandiri
}
