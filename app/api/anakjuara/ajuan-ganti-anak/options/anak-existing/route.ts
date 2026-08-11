/**
 * GET /api/anakjuara/ajuan-ganti-anak/options/anak-existing
 * Inactive pairings for current year (status_pasangan = 'n').
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
    const year = String(new Date().getFullYear());

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'kantor_id', 'p');
    const conditions = [scopeSql, `p.status_pasangan = 'n'`, 'p.tahun = ?'];
    const params: unknown[] = [...scopeParams, year];

    if (q) {
      conditions.push('(p.nama_anak LIKE ? OR p.id_anak LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like);
    }

    const rows = await query<{ id_anak: string; nama_anak: string }>(
      `SELECT DISTINCT p.id_anak, p.nama_anak
       FROM ajis_pemasangan p
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.nama_anak
       LIMIT ?`,
      [...params, limit],
    );

    return NextResponse.json({
      data: rows.map(r => ({
        value: r.id_anak,
        label: `${r.nama_anak} (${r.id_anak})`,
        id_anak: r.id_anak,
        nama_anak: r.nama_anak,
        nama_lengkap: r.nama_anak,
      })),
    });
  } catch (err) {
    console.error('[options anak-existing]', err);
    return NextResponse.json({ error: 'Gagal memuat opsi anak.' }, { status: 500 });
  }
}
