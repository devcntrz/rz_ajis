/**
 * types/peminjaman.ts — list rows / payloads for MySQL `ajis_peminjaman_anak`
 * (sipc_ijf, transisi track — lib/db.ts, `?` placeholders).
 *
 * The table (CLAUDE.md: no schema changes on the legacy MySQL track) has no
 * column distinguishing a donor borrower from an employee one. `tipe_peminjam`
 * below is derived at read time (LEFT JOIN against ajis_peminjam — a match
 * means 'donatur', no match means 'karyawan'), never stored.
 */

export type TipePeminjam = 'donatur' | 'karyawan';

export interface PeminjamanAnakRow {
  id_peminjaman: number;
  id_peminjam: string | null;
  tipe_peminjam: TipePeminjam;
  nama_peminjam: string | null;
  id_anak: string | null;
  nama_anak: string | null;
  jns_kel: string | null;
  jenjang_pendidikan: string | null;
  kantor_id: string | null;
  nama_kantor: string | null;
  id_wilayah_pembinaan: string | null;
  nama_wilayah: string | null;
  tgl_awal_peminjaman: string | null;
  tgl_selesai_peminjaman: string | null;
  tgl_expired: string | null;
  status_pinjam: 'y' | 'n';
  status_terpasangkan: 'y' | 'n';
  cancel: 'y' | 'n';
  alasan_cancel: string | null;
}

export interface PeminjamanAnakCreateInput {
  id_anak: string;
  tipe_peminjam: TipePeminjam;
  id_peminjam: string;
  nama_peminjam: string;
  tgl_awal_peminjaman: string;
  /** Loan length in days; tgl_expired is computed server-side. */
  jml_hari_peminjaman: number;
}

/** One employee eligible to be a "peminjam" — a ZISCO staffer, or their manager chain. */
export interface KaryawanPeminjam {
  id_karyawan: string;
  nama: string;
  panggilan: string;
  id_jabatan: string;
  id_kantor: number;
}
