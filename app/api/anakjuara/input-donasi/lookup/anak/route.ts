import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { searchAnakByDonatur } from '@/lib/input-donasi/queries';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const did = req.nextUrl.searchParams.get('did') ?? '';
    const q = req.nextUrl.searchParams.get('q') ?? '';
    if (!did) return NextResponse.json({ data: [] });

    const data = await searchAnakByDonatur(did, q);
    return NextResponse.json({ data });
  } catch (err) {
    return toErrorResponse('input-donasi lookup anak', err);
  }
}
