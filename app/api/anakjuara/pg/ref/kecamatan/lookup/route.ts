/**
 * GET /api/anakjuara/pg/ref/kecamatan/lookup — autocomplete/select-source
 * for the Kecamatan picker, narrowed by `kabid` (cascade step 3).
 *
 * GET ?q=&kabid= — session required, no row-scoping. Response: plain
 * array, max 50 rows; empty filters still return the first 50.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { RefKecamatanLookupItem } from '@/types/ref-pg';

const LOOKUP_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const kabid = req.nextUrl.searchParams.get('kabid')?.trim() || '';

    const conditions: string[] = ['c.aktif'];
    const params: unknown[] = [];
    let idx = 1;
    if (q) { conditions.push(`c.nama_kecamatan ILIKE $${idx++}`); params.push(`%${q}%`); }
    if (kabid) { conditions.push(`c.kabid = $${idx++}`); params.push(kabid); }

    const rows = await query<{ camatid: string; nama_kecamatan: string; kabid: string }>(
      `SELECT c.camatid, c.nama_kecamatan, c.kabid FROM ref_kecamatan c WHERE ${conditions.join(' AND ')}
       ORDER BY c.nama_kecamatan ASC LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    const data: RefKecamatanLookupItem[] = rows.map(r => ({ camatid: r.camatid, namaKecamatan: r.nama_kecamatan, kabid: r.kabid }));
    return NextResponse.json(data);
  } catch (err) {
    console.error('[pg ref kecamatan lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar kecamatan.' }, { status: 500 });
  }
}
