/**
 * GET /api/anakjuara/ajuan-ganti-anak/options/anak-calon
 * CAJ candidates: status_anak_juara = 'caj', aktif = 'y'.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    const q = req.nextUrl.searchParams.get('q') || '';
    const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)));

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'kantor_id', 'a');
    const conditions = [scopeSql, `a.status_anak_juara = 'caj'`, `a.aktif = 'y'`];
    const params: unknown[] = [...scopeParams];

    if (q) {
      conditions.push('(a.nama_lengkap LIKE ? OR a.id_anak LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like);
    }

    const rows = await query<{ id_anak: string; nama_lengkap: string }>(
      `SELECT a.id_anak, a.nama_lengkap
       FROM ajis_anak a
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.nama_lengkap
       LIMIT ?`,
      [...params, limit],
    );

    return NextResponse.json({
      data: rows.map(r => ({
        value: r.id_anak,
        label: `${r.nama_lengkap} (${r.id_anak})`,
        id_anak: r.id_anak,
        nama_anak: r.nama_lengkap,
        nama_lengkap: r.nama_lengkap,
      })),
    });
  } catch (err) {
    console.error('[options anak-calon]', err);
    return NextResponse.json({ error: 'Gagal memuat opsi calon AJ.' }, { status: 500 });
  }
}
