/**
 * GET  /api/anakjuara/input-donasi — grid Input Donasi (PRD §5.1).
 * POST /api/anakjuara/input-donasi — New Single (PRD §5.2).
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchInputDonasiList } from '@/lib/input-donasi/queries';
import { createSingleDonasi } from '@/lib/input-donasi/mutations';
import { listQuery, newSinglePayload, searchParamsToObject } from '@/lib/input-donasi/schema';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const parsed = listQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const { rows, total, footer } = await fetchInputDonasiList(parsed, g.session);

    return NextResponse.json({ data: rows, total, page: parsed.page, limit: parsed.limit, footer });
  } catch (err) {
    return toErrorResponse('input-donasi list', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const body = newSinglePayload.parse(await req.json());
    const result = await createSingleDonasi(body, g.session);

    return NextResponse.json({
      message: 'Donasi tersimpan.',
      ...result,
    }, { status: 201 });
  } catch (err) {
    return toErrorResponse('input-donasi create', err);
  }
}
