/** POST /api/anakjuara/input-donasi/special — Entry Special (multi-transaksi cicilan). */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { createSpecialDonasi } from '@/lib/input-donasi/mutations';
import { specialDonasiPayload } from '@/lib/input-donasi/schema';

export async function POST(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const body = specialDonasiPayload.parse(await req.json());
    const result = await createSpecialDonasi(body, g.session);

    return NextResponse.json({
      message: 'Entry Special tersimpan.',
      ...result,
    }, { status: 201 });
  } catch (err) {
    return toErrorResponse('input-donasi special create', err);
  }
}
