/**
 * GET /api/anakjuara/anak/[id]/kehadiran
 * Returns attendance history per session for a child.
 * Real structure: ajis_pembinaan_baru has one row per child per session.
 * We filter by id_anak and GROUP to get unique sessions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const semester = req.nextUrl.searchParams.get('semester') || '';

    const conditions = ['pb.id_anak = ?'];
    const qparams: unknown[] = [id];

    if (semester) {
      conditions.push('pb.semesterid = ?');
      qparams.push(semester);
    }

    const rows = await query<{
      id_pembinaan: string;
      tgl_pembinaan: string;
      semesterid: string;
      jenis_pembinaan: string;
      judul_materi: string;
      pemateri: string;
      kehadiran: string;
      keterangan: string;
      membantu_ortu: number;
      pembiasaan_shalat_wajib: number;
      pembiasaan_tilawah: number;
      pembiasaan_sedekah: number;
    }>(
      `SELECT pb.id_pembinaan, pb.tgl_pembinaan, pb.semesterid,
              pb.jenis_pembinaan, pb.judul_materi, pb.pemateri,
              pb.kehadiran, pb.keterangan,
              pb.membantu_ortu, pb.pembiasaan_shalat_wajib,
              pb.pembiasaan_tilawah, pb.pembiasaan_sedekah
       FROM   ajis_pembinaan_baru pb
       WHERE  ${conditions.join(' AND ')}
       ORDER  BY pb.tgl_pembinaan DESC
       LIMIT  100`,
      qparams,
    );

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[kehadiran]', err);
    return NextResponse.json({ error: 'Gagal memuat kehadiran.' }, { status: 500 });
  }
}
