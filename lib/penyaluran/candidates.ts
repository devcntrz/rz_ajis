/**
 * lib/penyaluran/candidates.ts — kandidat anak layak salur.
 *
 * Pengganti `ajis_view_anak_juara` (PRD-Penyaluran-NextJS §7.1): view lama tidak bisa
 * mendorong filter wilayah ke dalam GROUP BY-nya sehingga satu wilayah butuh 14–15
 * detik. Di sini filter wilayah/tahun/bulan didorong ke setiap subquery agregat
 * SEBELUM di-JOIN ke `ajis_pemasangan` (tabel dasar, terindeks, ~48ms).
 *
 * Dipakai bersama oleh New Bulk (preview seluruh kandidat 1 wilayah) dan New Single
 * (combogrid dengan `q` + `limit` kecil) — PRD §5.0c menyatukan kriteria yang di
 * legacy berbeda antara dua jalur itu.
 */
import { query } from '@/lib/db';
import { periode } from '@/lib/transaksi/rules';
import type { KandidatQuery } from '@/lib/penyaluran/schema';
import type { KandidatSalur } from '@/types/penyaluran';

export async function kandidatSalur(q: KandidatQuery): Promise<KandidatSalur[]> {
  const per = periode(q.bulan);
  const [bulanAwal, bulanAkhir] = per === 'ganjil' ? [1, 6] : [7, 12];

  // Params order must match the SQL below exactly (donasi subq, salur subq, then main WHERE).
  const donasiParams = [q.tahun, bulanAwal, bulanAkhir, q.wilayahId];
  const salurParams = [q.tahun, bulanAwal, bulanAkhir, q.wilayahId];
  const mainParams: unknown[] = [q.wilayahId, q.tahun];

  if (q.kantorId) { mainParams.push(q.kantorId); }
  if (q.q) {
    const like = `%${q.q}%`;
    mainParams.push(like, like);
  }

  const allParams = [...donasiParams, ...salurParams, ...mainParams, q.limit];

  const rows = await query<KandidatSalur>(
    `SELECT p.id_pemasangan_baru, p.id_anak, p.nama_anak, p.nik, p.jenjang_pendidikan,
            p.kelas, p.jns_kel, p.asnaf, p.id_donatur, p.nama_donatur,
            p.id_wilayah_pembinaan, p.nama_wilayah, p.kantor_id, p.nama_kantor,
            p.program_donasi, p.id_program, p.harga_program, p.harga_penyaluran,
            IFNULL(b.no_rekening, p.no_rekening) AS no_rekening,
            b.nama_bank AS nama_bank, b.pemilik_rekening AS pemilik_rekening,
            COALESCE(o.saldo_awal_${per}, 0)                            AS saldo_awal,
            COALESCE(d.donasi, 0)                                       AS donasi,
            COALESCE(s.salur,  0)                                       AS tersalurkan,
            COALESCE(o.saldo_awal_${per}, 0) + COALESCE(d.donasi, 0)
                                             - COALESCE(s.salur, 0)      AS saldo_akhir
     FROM ajis_pemasangan p
     LEFT JOIN ajis_anak b ON b.id_anak = p.id_anak
     LEFT JOIN ajis_opname o ON o.id_pemasangan_baru = p.id_pemasangan_baru
     LEFT JOIN (
       SELECT id_pemasangan_baru, SUM(nominal_donasi) AS donasi
       FROM ajis_input_donasi
       WHERE tahun = ? AND jenis = 'trans' AND bulan BETWEEN ? AND ? AND id_wilayah_pembinaan = ?
       GROUP BY id_pemasangan_baru
     ) d ON d.id_pemasangan_baru = p.id_pemasangan_baru
     LEFT JOIN (
       SELECT id_pemasangan_baru, SUM(nominal_penyaluran) AS salur
       FROM ajis_penyaluran
       WHERE tahun = ? AND bulan BETWEEN ? AND ? AND id_wilayah_pembinaan = ?
       GROUP BY id_pemasangan_baru
     ) s ON s.id_pemasangan_baru = p.id_pemasangan_baru
     WHERE p.status_pasangan = 'y'
       AND p.id_wilayah_pembinaan = ?
       AND p.tahun = ?
       AND p.program_donasi NOT LIKE '%khusus%'
       AND p.id_program != '0'
       AND p.tunda_penyaluran = ''
       ${q.kantorId ? 'AND p.kantor_id = ?' : ''}
       ${q.q ? 'AND (p.id_anak LIKE ? OR p.nama_anak LIKE ?)' : ''}
     HAVING saldo_akhir >= p.harga_program
     ORDER BY p.jenjang_pendidikan, p.nama_anak
     LIMIT ?`,
    allParams,
  );

  return rows;
}

/**
 * Anak yang sudah punya baris `ajis_penyaluran` di bulan+tahun yang sama — dicegah
 * dobel-salur saat commit New Bulk (PRD §7.4 poin 4, lampiran E).
 */
export async function alreadySalur(
  idAnakList: string[], bulan: number, tahun: number,
): Promise<Set<string>> {
  if (idAnakList.length === 0) return new Set();
  const ph = idAnakList.map(() => '?').join(',');
  const rows = await query<{ id_anak: string }>(
    `SELECT id_anak FROM ajis_penyaluran
     WHERE tahun = ? AND bulan = ? AND id_anak IN (${ph})`,
    [String(tahun), String(bulan), ...idAnakList],
  );
  return new Set(rows.map(r => r.id_anak));
}
