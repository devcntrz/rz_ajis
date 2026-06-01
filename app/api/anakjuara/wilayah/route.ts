/**
 * GET /api/anakjuara/wilayah
 * Returns active wilayah list from database.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWilayahList } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const list = await getWilayahList();
    return NextResponse.json({ data: list });
  } catch (err) {
    console.error('[wilayah list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar wilayah.' }, { status: 500 });
  }
}
