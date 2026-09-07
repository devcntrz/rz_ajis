import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { searchTransaksiByDonatur } from '@/lib/input-donasi/queries';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const did = req.nextUrl.searchParams.get('did') ?? '';
    if (!did) return NextResponse.json({ data: [] });

    const data = await searchTransaksiByDonatur(did);
    return NextResponse.json({ data });
  } catch (err) {
    return toErrorResponse('input-donasi lookup transaksi', err);
  }
}
