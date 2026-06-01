/**
 * GET /api/anakjuara/pemateri — SDM pemateri (searchable, max 10)
 * ajis_sdm_wilayah JOIN ajis_jabatan_sdm, scoped to session wilayah
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

    const wilayahId = session.idWilayahPembinaan;
    if (!wilayahId) {
      return NextResponse.json({ data: [] });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const limit = Math.min(
      SEARCH_SELECT_LIMIT,
      Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || String(SEARCH_SELECT_LIMIT), 10)),
    );

    const conditions = [
      'j.id_wilayah_pembinaan = ?',
      `(s.aktif IS NULL OR s.aktif = '' OR s.aktif = 'y')`,
    ];
    const params: unknown[] = [String(wilayahId)];

    if (q) {
      conditions.push('s.nama_lengkap LIKE ?');
      params.push(`%${q}%`);
    }

    const rows = await query<{ id_sdm: string; nama_lengkap: string }>(
      `SELECT DISTINCT CAST(s.id_sdm AS CHAR) AS id_sdm, s.nama_lengkap
       FROM ajis_sdm_wilayah s
       INNER JOIN ajis_jabatan_sdm j ON CAST(j.id_sdm AS CHAR) = CAST(s.id_sdm AS CHAR)
       WHERE ${conditions.join(' AND ')}
       ORDER BY s.nama_lengkap ASC
       LIMIT ?`,
      [...params, limit],
    );

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[pemateri list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar pemateri.' }, { status: 500 });
  }
}
