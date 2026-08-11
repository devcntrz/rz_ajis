/**
 * GET /api/anakjuara/wilayah
 * Active wilayah list, optionally scoped by kantor.
 * - Group 2: always forced to session.idKantor
 * - Group 1: optional ?kantor_id= filter
 * - Other: no kantor filter (existing behavior)
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getWilayahList } from '@/lib/cache';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kantorParam = req.nextUrl.searchParams.get('kantor_id') || '';
    let kantorId: string | null = null;

    if (session.idGroupUser === 2) {
      kantorId = session.idKantor;
    } else if (session.idGroupUser === 1 && kantorParam) {
      kantorId = kantorParam;
    }

    if (kantorId) {
      const list = await query<{
        id_wilayah_pembinaan: number;
        nama_wilayah: string;
        kantor_id: string;
      }>(
        `SELECT id_wilayah_pembinaan, MIN(nama_wilayah) AS nama_wilayah, MIN(kantor_id) AS kantor_id
         FROM ajis_wilayah_pembinaan
         WHERE aktif = 'y' AND kantor_id = ?
         GROUP BY id_wilayah_pembinaan
         ORDER BY nama_wilayah`,
        [kantorId],
      );
      return NextResponse.json({ data: list });
    }

    // Admin without kantor filter (or other roles): full cached list
    const list = await getWilayahList();
    return NextResponse.json({ data: list });
  } catch (err) {
    console.error('[wilayah list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar wilayah.' }, { status: 500 });
  }
}
