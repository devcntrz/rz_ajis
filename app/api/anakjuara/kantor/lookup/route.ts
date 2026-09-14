/**
 * GET /api/anakjuara/kantor/lookup — legacy MySQL kantor list for the anak
 * edit form's kantor_id picker. Unlike /api/anakjuara/kantor (group1/2 only,
 * used by admin filters), this is open to any logged-in session since a
 * scoped user still needs to see (their own, forced) kantor when editing an
 * anak record — the PATCH route itself re-validates scope server-side.
 * Response matches the *-pg lookup convention: plain array, no envelope.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.idGroupUser === 2) {
      return NextResponse.json([{ id_kantor: session.idKantor, nama_kantor: session.namaKantor }]);
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const conditions = [`kantor_id != ''`, `nama_kantor != ''`];
    const params: unknown[] = [];
    if (q) {
      conditions.push('nama_kantor LIKE ?');
      params.push(`%${q}%`);
    }

    const rows = await query<{ id_kantor: string; nama_kantor: string }>(
      `SELECT DISTINCT kantor_id AS id_kantor, nama_kantor
       FROM ajis_pemasangan
       WHERE ${conditions.join(' AND ')}
       ORDER BY nama_kantor
       LIMIT 50`,
      params,
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[kantor lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar kantor.' }, { status: 500 });
  }
}
