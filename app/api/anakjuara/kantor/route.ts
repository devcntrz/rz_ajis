/**
 * GET /api/anakjuara/kantor — distinct kantor list for admin filters.
 * Group 2 only sees own kantor.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12 } from '@/lib/auth';

export async function GET() {
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

    if (session.idGroupUser === 2) {
      return NextResponse.json({
        data: [{
          id_kantor: session.idKantor,
          nama_kantor: session.namaKantor,
        }],
      });
    }

    const rows = await query<{ id_kantor: string; nama_kantor: string }>(
      `SELECT DISTINCT kantor_id AS id_kantor, nama_kantor
       FROM ajis_pemasangan
       WHERE kantor_id != '' AND nama_kantor != ''
       ORDER BY nama_kantor
       LIMIT 500`,
    );

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[kantor list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar kantor.' }, { status: 500 });
  }
}
