/**
 * GET  /api/anakjuara/penyaluran — grid batch, tab Wilayah (PRD §5.0a, §7.3).
 * POST /api/anakjuara/penyaluran — New Bulk (PRD §5.3 / §7.4).
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchBatchList } from '@/lib/penyaluran/queries';
import { createBulkPenyaluran } from '@/lib/penyaluran/mutations';
import { batchListQuery, newBulkPayload, searchParamsToObject } from '@/lib/penyaluran/schema';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const parsed = batchListQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const { rows, total } = await fetchBatchList(parsed, g.session);

    return NextResponse.json({ data: rows, total, page: parsed.page, limit: parsed.limit });
  } catch (err) {
    return toErrorResponse('penyaluran list', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const body = newBulkPayload.parse(await req.json());
    const result = await createBulkPenyaluran(body, g.session);

    return NextResponse.json({
      message: `Batch dibuat: ${result.jumlah_anak} anak disalurkan` +
        (result.dilewati > 0 ? `, ${result.dilewati} dilewati (sudah tersalur bulan ini).` : '.'),
      ...result,
    }, { status: 201 });
  } catch (err) {
    return toErrorResponse('penyaluran create bulk', err);
  }
}
