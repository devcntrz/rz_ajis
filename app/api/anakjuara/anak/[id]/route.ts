/**
 * GET /api/anakjuara/anak/[id] — Child detail
 * Returns full child record including parent data
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const anak = await queryOne<Record<string, unknown>>(
      `SELECT a.id_anak, a.nik, a.nama_lengkap, a.nama_panggilan,
              a.agama, a.jns_kel, a.tempat_lahir, a.tgl_lahir,
              a.anak_ke, a.dari_saudara, a.alamat,
              a.jenjang_pendidikan, a.kelas, a.nama_sekolah,
              a.asnaf, a.status_ortu, a.status_tersantuni,
              a.id_wilayah_pembinaan, a.kantor_id, a.nama_wilayah, a.nama_kantor,
              a.tgl_terdaftar, a.foto, a.hobi, a.prestasi,
              a.aktif, a.tinggal_bersama,
              a.nama_lengkap_ayah, a.pekerjaan_ayah, a.penghasilan_rata_rata_ayah,
              a.tanggal_kematian_ayah,
              a.nama_lengkap_ibu, a.pekerjaan_ibu, a.penghasilan_rata_rata_ibu,
              a.tanggal_kematian_ibu,
              a.nama_lengkap_wali, a.pekerjaan_wali,
              a.telp_yang_bisa_dihubungi, a.atas_nama, a.hubungan_kerabat,
              a.no_rekening, a.nama_bank, a.pemilik_rekening
       FROM   ajis_anak a
       WHERE  a.id_anak = ?
       LIMIT  1`,
      [id],
    );

    if (!anak) return NextResponse.json({ error: 'Anak tidak ditemukan.' }, { status: 404 });

    return NextResponse.json({ data: anak });
  } catch (err) {
    console.error('[anak detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data anak.' }, { status: 500 });
  }
}
