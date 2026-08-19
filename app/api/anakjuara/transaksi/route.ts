/**
 * GET /api/anakjuara/transaksi — grid for all four tabs.
 *
 * Replaces legacy `m=r`, `m=r_review`, `m=r_cicilan` and `m=r_unidentified`, which were
 * four near-identical methods differing only in their fixed WHERE base. Pick one with
 * `?scope=main|review|cicilan|unidentified`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchTransaksiList } from '@/lib/transaksi/queries';
import { listQuery, searchParamsToObject } from '@/lib/transaksi/schema';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const parsed = listQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const { rows, total, footer } = await fetchTransaksiList(parsed, g.session);

    return NextResponse.json({
      data:  rows,
      total,
      page:  parsed.page,
      limit: parsed.limit,
      footer,
    });
  } catch (err) {
    return toErrorResponse('list', err);
  }
}
