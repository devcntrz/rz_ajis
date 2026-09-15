/**
 * GET /api/anakjuara/kantor/lookup — legacy MySQL kantor list for the anak
 * edit/create form's kantor_id picker. Unlike /api/anakjuara/kantor (group1/2
 * only, used by admin filters), this is open to any logged-in session since a
 * scoped user still needs to see (their own, forced) kantor when editing an
 * anak record — the PATCH/POST route itself re-validates scope server-side.
 * Response matches the *-pg lookup convention: plain array, no envelope.
 *
 * Sources from ajis_kantor (oid, kantor) — the real office master table —
 * rather than DISTINCT kantor_id/nama_kantor off ajis_pemasangan, which is a
 * sponsorship-pairing table: it only carries a kantor row for children who
 * already have an active pairing, so brand-new/unpaired kantor never showed
 * up here and the id_wilayah_pembinaan lookup below (keyed off ajis_kantor's
 * own oid) could silently mismatch.
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
    const conditions = [`oid != ''`, `kantor != ''`];
    const params: unknown[] = [];
    if (q) {
      conditions.push('kantor LIKE ?');
      params.push(`%${q}%`);
    }

    const rows = await query<{ id_kantor: string; nama_kantor: string }>(
      `SELECT oid AS id_kantor, kantor AS nama_kantor
       FROM ajis_kantor
       WHERE ${conditions.join(' AND ')}
       ORDER BY kantor
       LIMIT 50`,
      params,
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[kantor lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar kantor.' }, { status: 500 });
  }
}
