/**
 * GET /api/anakjuara/pg/wilayah/lookup — autocomplete/select-source for
 * cascading Kantor→Wilayah pickers elsewhere (Manajemen User, Pengajuan
 * Beasiswa) to resolve a coaching region by name, optionally scoped to one
 * kantor.
 *
 * Contract:
 *   GET /api/anakjuara/pg/wilayah/lookup?q=&kantor_id=
 *   - q: optional, ILIKE match on nama_wilayah.
 *   - kantor_id: optional, exact match on kantor_id (the ajis_kantor.oid this
 *     wilayah belongs to) — pass the oid selected from the kantor lookup to
 *     narrow the wilayah list to just that branch's regions.
 *   - session required (401 if not logged in); role-scoped the same way as
 *     GET /api/anakjuara/pg/wilayah (group 1 = all, group 2 = own kantor_id
 *     only, other groups = own id_wilayah_pembinaan only) — so a branch
 *     admin's picker only shows their own kantor's regions regardless of the
 *     kantor_id param.
 *   - Response: plain array (no `{ data }` envelope), matching the kantor
 *     lookup convention:
 *       Array<{ idWilayahPembinaan: number; namaWilayah: string; kantorId: string | null }>
 *   - Max 50 rows. An empty `q` still returns the first 50 (scoped, aktif)
 *     rows rather than nothing — same convention as the kantor lookup, good
 *     for populating a `<select>` up front.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { AjisWilayahLookupItem } from '@/types/wilayah-pg';

const LOOKUP_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const kantorId = req.nextUrl.searchParams.get('kantor_id')?.trim() || '';

    const conditions: string[] = ['w.aktif'];
    const params: unknown[] = [];
    let idx = 1;
    const push = (sql: string, ...vals: unknown[]) => {
      const ph = vals.map(() => `$${idx++}`);
      conditions.push(ph.reduce((acc, p) => acc.replace('?', p), sql));
      params.push(...vals);
    };

    // Role scoping (§2.1a), same as GET /api/anakjuara/pg/wilayah.
    if (session.idGroupUser === 2) {
      push('w.kantor_id = ?', session.idKantor);
    } else if (session.idGroupUser !== 1) {
      push('w.id_wilayah_pembinaan = ?', session.idWilayahPembinaan);
    }

    if (q) push('w.nama_wilayah ILIKE ?', `%${q}%`);
    if (kantorId) push('w.kantor_id = ?', kantorId);

    const WHERE = `WHERE ${conditions.join(' AND ')}`;

    const rows = await query<{ id_wilayah_pembinaan: number; nama_wilayah: string; kantor_id: string | null }>(
      `SELECT w.id_wilayah_pembinaan, w.nama_wilayah, w.kantor_id
       FROM ajis_wilayah_pembinaan w
       ${WHERE}
       ORDER BY w.nama_wilayah ASC
       LIMIT ${LOOKUP_LIMIT}`,
      params,
    );

    const data: AjisWilayahLookupItem[] = rows.map(r => ({
      idWilayahPembinaan: r.id_wilayah_pembinaan,
      namaWilayah: r.nama_wilayah,
      kantorId: r.kantor_id,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error('[pg wilayah lookup]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar wilayah.' }, { status: 500 });
  }
}
