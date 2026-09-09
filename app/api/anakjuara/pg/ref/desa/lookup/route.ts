/**
 * GET /api/anakjuara/pg/ref/desa/lookup — autocomplete/select-source for
 * the Desa/Kelurahan picker, narrowed by `camatid` (cascade step 4, leaf of
 * Propinsi→Kabupaten→Kecamatan→Desa).
 *
 * GET ?q=&camatid= — session required, no row-scoping. Response: plain
 * array, max 50 rows; empty filters still return the first 50.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { RefDesaLookupItem } from '@/types/ref-pg';

const LOOKUP_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const camatid = req.nextUrl.searchParams.get('camatid')?.trim() || '';

    const conditions: string[] = ['d.aktif'];
    const params: unknown[] = [];
    let idx = 1;
    if (q) { conditions.push(`d.nama_desa ILIKE $${idx++}`); params.push(`%${q}%`); }
    if (camatid) { conditions.push(`d.camatid = $${idx++}`); params.push(camatid); }

    const rows = await query<{ desaid: string; nama_desa: string; camatid: string }>(
      `SELECT d.desaid, d.nama_desa, d.camatid FROM ref_desa d WHERE ${conditions.join(' AND ')}
       ORDER BY d.nama_desa ASC LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    const data: RefDesaLookupItem[] = rows.map(r => ({ desaid: r.desaid, namaDesa: r.nama_desa, camatid: r.camatid }));
    return NextResponse.json(data);
  } catch (err) {
    console.error('[pg ref desa lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar desa.' }, { status: 500 });
  }
}
