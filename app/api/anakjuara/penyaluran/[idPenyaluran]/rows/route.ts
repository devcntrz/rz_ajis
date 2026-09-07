/** POST /api/anakjuara/penyaluran/{id}/rows — New Single: tambah satu anak ke batch. */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { createSingleRow } from '@/lib/penyaluran/mutations';
import { newSingleRowPayload } from '@/lib/penyaluran/schema';

export async function POST(req: NextRequest, { params }: { params: Promise<{ idPenyaluran: string }> }) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran } = await params;
    const body = newSingleRowPayload.parse(await req.json());
    const result = await createSingleRow(idPenyaluran, body.idAnak, g.session);

    return NextResponse.json({ message: 'Anak ditambahkan ke batch.', ...result }, { status: 201 });
  } catch (err) {
    return toErrorResponse('penyaluran new single row', err);
  }
}
