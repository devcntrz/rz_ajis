/**
 * PATCH …/program — change the transaction's program (legacy `m=update_program`).
 */
import { NextResponse } from 'next/server';
import { guard, parseDetailId, toErrorResponse } from '@/lib/transaksi/api';
import { gantiProgram } from '@/lib/transaksi/mutations';
import { gantiProgramPayload } from '@/lib/transaksi/schema';

interface Ctx {
  params: Promise<{ transid: string; detailid: string }>;
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { transid, detailid } = await params;
    const body = gantiProgramPayload.parse(await req.json());

    const result = await gantiProgram(
      decodeURIComponent(transid),
      parseDetailId(detailid),
      body.id_program,
      g.session,
    );

    return NextResponse.json({
      data: { ok: true, ...result },
      message: `Program diubah menjadi ${result.nama_program}.`,
    });
  } catch (err) {
    return toErrorResponse('ganti-program', err);
  }
}
