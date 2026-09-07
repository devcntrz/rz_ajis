/** GET /api/anakjuara/penyaluran/{id} — detail batch (PRD §5.0b). */
import { NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchBatchDetail } from '@/lib/penyaluran/queries';

export async function GET(_req: Request, { params }: { params: Promise<{ idPenyaluran: string }> }) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran } = await params;
    const data = await fetchBatchDetail(idPenyaluran, g.session);

    return NextResponse.json({ data });
  } catch (err) {
    return toErrorResponse('penyaluran detail', err);
  }
}
