/**
 * GET /api/anakjuara/penyaluran/kandidat — preview kandidat New Bulk & combogrid New Single.
 * Satu endpoint menggantikan 4 method legacy (anak, anak_ganjil, anak_genap, anak_single) —
 * PRD §5.0c menyatukan kriteria layak salur untuk kedua jalur.
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { kandidatSalur } from '@/lib/penyaluran/candidates';
import { kandidatQuery, searchParamsToObject } from '@/lib/penyaluran/schema';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const parsed = kandidatQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const data = await kandidatSalur(parsed);

    return NextResponse.json({ data });
  } catch (err) {
    return toErrorResponse('penyaluran kandidat', err);
  }
}
