import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { searchDonatur } from '@/lib/input-donasi/queries';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const q = req.nextUrl.searchParams.get('q') ?? '';
    const data = await searchDonatur(q, g.session);
    return NextResponse.json({ data });
  } catch (err) {
    return toErrorResponse('input-donasi lookup donatur', err);
  }
}
