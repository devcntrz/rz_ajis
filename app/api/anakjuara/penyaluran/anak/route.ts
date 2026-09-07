/** GET /api/anakjuara/penyaluran/anak — grid tab Anak (lintas batch). */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchAnakList } from '@/lib/penyaluran/queries';
import { anakListQuery, searchParamsToObject } from '@/lib/penyaluran/schema';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const parsed = anakListQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const { rows, total } = await fetchAnakList(parsed, g.session);

    return NextResponse.json({ data: rows, total, page: parsed.page, limit: parsed.limit });
  } catch (err) {
    return toErrorResponse('penyaluran anak list', err);
  }
}
