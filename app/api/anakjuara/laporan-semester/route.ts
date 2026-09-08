/**
 * GET /api/anakjuara/laporan-semester — Lapsem grid list (filters + pagination).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchLapsemList } from '@/lib/laporanSemester/queries';
import type { LapsemListParams } from '@/types/laporan-semester';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const filters: LapsemListParams = {
      page: Number(sp.get('page') ?? 1),
      limit: Number(sp.get('limit') ?? 50),
      q: sp.get('q') || undefined,
      kantor_id: sp.get('kantor_id') || undefined,
      id_wilayah_pembinaan: sp.get('id_wilayah_pembinaan') || undefined,
      semesterid: sp.get('semesterid') || undefined,
      keyjenjang: sp.get('keyjenjang') || undefined,
      key_approve: (sp.get('key_approve') as 'ya' | 'tidak' | '') || undefined,
    };

    const { rows, total } = await fetchLapsemList(filters, session);

    return NextResponse.json({
      data: rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
      },
    });
  } catch (err) {
    console.error('[laporan-semester list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar laporan semester.' }, { status: 500 });
  }
}
