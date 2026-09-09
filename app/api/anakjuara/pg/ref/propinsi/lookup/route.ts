/**
 * GET /api/anakjuara/pg/ref/propinsi/lookup — autocomplete/select-source for
 * the Propinsi picker (root of the cascading Propinsi→Kabupaten→Kecamatan→
 * Desa pickers). Mirrors app/api/anakjuara/pg/wilayah/lookup/route.ts.
 *
 * GET ?q= — optional ILIKE on propinsi. Session required, no row-scoping.
 * Response: plain array, max 50 rows; empty q still returns the first 50.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { RefPropinsiLookupItem } from '@/types/ref-pg';

const LOOKUP_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const conditions: string[] = ['p.aktif'];
    const params: unknown[] = [];
    if (q) {
      conditions.push('p.propinsi ILIKE $1');
      params.push(`%${q}%`);
    }

    const rows = await query<{ propid: string; propinsi: string }>(
      `SELECT p.propid, p.propinsi FROM ref_propinsi p WHERE ${conditions.join(' AND ')}
       ORDER BY p.propinsi ASC LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    const data: RefPropinsiLookupItem[] = rows.map(r => ({ propid: r.propid, propinsi: r.propinsi }));
    return NextResponse.json(data);
  } catch (err) {
    console.error('[pg ref propinsi lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar propinsi.' }, { status: 500 });
  }
}
