/**
 * GET /api/anakjuara/pg/anak/lookup — autocomplete for other Postgres features
 * (e.g. the upcoming "Data Survey" page) to pick a child by name/id_anak.
 *
 * Response is a plain array — no `{ data }` envelope — so downstream consumers get
 * a small, stable, predictable shape: `{ id_anak: string; nama_lengkap: string }[]`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { AnakPgLookupItem } from '@/types/anak-pg';

const LOOKUP_LIMIT = 20;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';

    const conditions: string[] = ['a.aktif'];
    const params: unknown[] = [];
    let idx = 1;
    const push = (sql: string, ...vals: unknown[]) => {
      const ph = vals.map(() => `$${idx++}`);
      conditions.push(ph.reduce((acc, p) => acc.replace('?', p), sql));
      params.push(...vals);
    };

    if (session.idGroupUser === 2) {
      push('a.kantor_id = ?', session.idKantor);
    } else if (session.idGroupUser !== 1) {
      push('a.id_wilayah_pembinaan = ?::bigint', session.idWilayahPembinaan);
    }
    if (q) {
      push('(a.nama_lengkap ILIKE ? OR a.id_anak ILIKE ?)', `%${q}%`, `%${q}%`);
    }

    const rows = await query<AnakPgLookupItem>(
      `SELECT a.id_anak, a.nama_lengkap
       FROM ajis_anak a
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.nama_lengkap ASC
       LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[pg anak lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar anak.' }, { status: 500 });
  }
}
