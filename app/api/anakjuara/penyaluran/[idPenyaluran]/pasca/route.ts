/** POST /api/anakjuara/penyaluran/{id}/pasca — Pasca Penyaluran (kunci batch, satu arah). */
import { NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { pascaPenyaluran } from '@/lib/penyaluran/mutations';

export async function POST(_req: Request, { params }: { params: Promise<{ idPenyaluran: string }> }) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran } = await params;
    await pascaPenyaluran(idPenyaluran);

    return NextResponse.json({ message: 'Batch dikunci (Pasca Penyaluran).' });
  } catch (err) {
    return toErrorResponse('penyaluran pasca', err);
  }
}
