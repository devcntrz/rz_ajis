/**
 * GET /api/anakjuara/hafalan/items
 * Returns cached hafalan master items list.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getHafalanItems } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await getHafalanItems();
    return NextResponse.json({ data: items });
  } catch (err) {
    console.error('[hafalan items]', err);
    return NextResponse.json({ error: 'Gagal memuat item hafalan.' }, { status: 500 });
  }
}
