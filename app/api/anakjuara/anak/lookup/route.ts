/**
 * GET /api/anakjuara/anak/lookup — autocomplete to pick a child by name/id_anak
 * (MySQL). Used by the Data Survey "Tambah Survey" picker.
 *
 * Response is a plain array — no `{ data }` envelope — mirrors
 * app/api/anakjuara/pg/anak/lookup/route.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';

const LOOKUP_LIMIT = 20;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');
    const conditions: string[] = [scope, `a.aktif = 'y'`];
    const params: unknown[] = [...scopeParams];

    if (q) {
      conditions.push('(a.nama_lengkap LIKE ? OR a.id_anak LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const rows = await query<{ id_anak: string; nama_lengkap: string }>(
      `SELECT a.id_anak, a.nama_lengkap
       FROM ajis_anak a
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.nama_lengkap ASC
       LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[anak lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar anak.' }, { status: 500 });
  }
}
