/**
 * GET /api/anakjuara/pg/kantor/lookup — autocomplete/select-source for other
 * Postgres features (e.g. Master Wilayah Pembinaan's kantor picker) to resolve a
 * branch office by name/oid.
 *
 * Response is a plain array — no `{ data }` envelope — matching the anak lookup
 * convention: `{ oid: string; kantor: string | null }[]`.
 *
 * `ajis_kantor` is a small global master table, so unlike the anak lookup's
 * narrow 20-row autocomplete, an empty `q` here still returns the first 50 rows
 * rather than nothing — most callers populating a `<select>` want the (near-)full
 * list up front.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { AjisKantorLookupItem } from '@/types/kantor-pg';

const LOOKUP_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const oidParent = req.nextUrl.searchParams.get('oid_parent')?.trim() || '';

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const push = (sql: string, ...vals: unknown[]) => {
      const ph = vals.map(() => `$${idx++}`);
      conditions.push(ph.reduce((acc, p) => acc.replace('?', p), sql));
      params.push(...vals);
    };

    if (q) {
      push('(k.kantor ILIKE ? OR k.oid ILIKE ?)', `%${q}%`, `%${q}%`);
    }
    if (oidParent) push('k.oid_parent = ?', oidParent);

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = await query<AjisKantorLookupItem>(
      `SELECT k.oid, k.kantor
       FROM ajis_kantor k
       ${WHERE}
       ORDER BY k.kantor ASC
       LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[pg kantor lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar kantor.' }, { status: 500 });
  }
}
