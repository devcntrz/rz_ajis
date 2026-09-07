/** POST /api/anakjuara/penyaluran/{id}/teknis — Update Tgl-SDM (Teknis Penyaluran). */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { teknisPenyaluran } from '@/lib/penyaluran/mutations';
import { teknisPayload } from '@/lib/penyaluran/schema';

export async function POST(req: NextRequest, { params }: { params: Promise<{ idPenyaluran: string }> }) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran } = await params;
    const body = teknisPayload.parse(await req.json());
    const result = await teknisPenyaluran(idPenyaluran, body);

    return NextResponse.json({ message: 'Tgl penyaluran & SDM diperbarui.', ...result });
  } catch (err) {
    return toErrorResponse('penyaluran teknis', err);
  }
}
