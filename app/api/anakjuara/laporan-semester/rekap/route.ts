/**
 * GET /api/anakjuara/laporan-semester/rekap — aggregate per kantor (Rekap tab).
 * Query params: semesterid (required), jenis_laporan (default 'reguler').
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchRekapByKantor } from '@/lib/laporanSemester/queries';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const semesterid = sp.get('semesterid');
    if (!semesterid) {
      return NextResponse.json({ error: 'Parameter semesterid wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    const jenisLaporan = sp.get('jenis_laporan') || 'reguler';

    const rows = await fetchRekapByKantor(semesterid, jenisLaporan, session);
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[laporan-semester rekap]', err);
    return NextResponse.json({ error: 'Gagal memuat rekap laporan semester.' }, { status: 500 });
  }
}
