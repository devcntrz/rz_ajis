/** types/calon-anak-juara.ts — list rows from ajis_anak where status_anak_juara = 'caj' */

export interface CalonAnakJuaraRow {
  id_anak: string;
  nama_lengkap: string;
  jns_kel: string;
  kelas: string;
  status_ortu: string;
  jenjang_pendidikan: string;
  foto: string;
  tgl_peminjaman: string | null;
  nia_rfo_book: string;
  nama_rfo_book: string;
  book_via: string;
  user_book: string;
  tgl_terdaftar: string | null;
  nama_kantor: string;
  nama_wilayah: string;
  alamat: string;
  kantor_id: string;
  id_wilayah_pembinaan: number | string;
  status_pinjam: 'y' | 'n';
}

export interface CalonAnakJuaraListParams {
  q?: string;
  kantor_id?: string;
  wilayah?: string;
  kelas?: string;
  jenjang?: string;
  status_ortu?: string;
  booked?: string;
  book_via?: string;
  tgl_terdaftar_from?: string;
  tgl_terdaftar_to?: string;
  page?: string | number;
  limit?: string | number;
}
