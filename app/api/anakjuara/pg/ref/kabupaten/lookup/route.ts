/**
 * GET /api/anakjuara/pg/ref/kabupaten/lookup — autocomplete/select-source
 * for the Kabupaten picker, narrowed by `propid` (cascade step 2 of
 * Propinsi→Kabupaten→Kecamatan→Desa).
 *
 * GET ?q=&propid= — session required, no row-scoping. Response: plain
 * array, max 50 rows; empty filters still return the first 50.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { RefKabupatenLookupItem } from '@/types/ref-pg';

const LOOKUP_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const propid = req.nextUrl.searchParams.get('propid')?.trim() || '';

    const conditions: string[] = ['k.aktif'];
    const params: unknown[] = [];
    let idx = 1;
    if (q) { conditions.push(`k.kabupaten ILIKE $${idx++}`); params.push(`%${q}%`); }
    if (propid) { conditions.push(`k.propid = $${idx++}`); params.push(propid); }

    const rows = await query<{ kabid: string; kabupaten: string; propid: string }>(
      `SELECT k.kabid, k.kabupaten, k.propid FROM ref_kabupaten k WHERE ${conditions.join(' AND ')}
       ORDER BY k.kabupaten ASC LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    const data: RefKabupatenLookupItem[] = rows.map(r => ({ kabid: r.kabid, kabupaten: r.kabupaten, propid: r.propid }));
    return NextResponse.json(data);
  } catch (err) {
    console.error('[pg ref kabupaten lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar kabupaten.' }, { status: 500 });
  }
}
