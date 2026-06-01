/**
 * GET /api/anakjuara/semester — Semester list (searchable, max 10)
 * Current semester first, then by tgl_awal.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SEARCH_SELECT_LIMIT } from '@/lib/searchSelect';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const limit = Math.min(
      SEARCH_SELECT_LIMIT,
      Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || String(SEARCH_SELECT_LIMIT), 10)),
    );

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q) {
      conditions.push('(semester LIKE ? OR semesterid LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like);
    }

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = await query<{
      semesterid: string;
      semester: string;
      tgl_awal: string;
      tgl_akhir: string;
      is_current: number;
    }>(
      `SELECT semesterid, semester, tgl_awal, tgl_akhir,
              CASE WHEN CURDATE() BETWEEN tgl_awal AND tgl_akhir THEN 1 ELSE 0 END AS is_current
       FROM ajis_semester
       ${WHERE}
       ORDER BY is_current DESC, tgl_awal ASC
       LIMIT ?`,
      [...params, limit],
    );

    return NextResponse.json({
      data: rows.map(r => ({
        semesterid: r.semesterid,
        semester:   r.semester,
        tgl_awal:   r.tgl_awal,
        tgl_akhir:  r.tgl_akhir,
        is_current: r.is_current === 1,
      })),
    });
  } catch (err) {
    console.error('[semester list]', err);
    return NextResponse.json({ error: 'Gagal memuat semester.' }, { status: 500 });
  }
}
