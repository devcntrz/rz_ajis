/**
 * GET /api/anakjuara/transaksi/options — every dropdown the Transaksi screen needs.
 *
 * Replaces legacy `m=kantor`, `m=kantor_trans` and `m=program`. All three are cached
 * master data, so serving them together costs one request instead of three.
 */
import { NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { getAjisKantorOptions, getKantorTransOptions, getProgramOptions } from '@/lib/cache';

export async function GET() {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const [kantorIjis, kantorTrans, program] = await Promise.all([
      getAjisKantorOptions(),
      getKantorTransOptions(),
      getProgramOptions(),
    ]);

    return NextResponse.json({
      data: { kantor_ijis: kantorIjis, kantor_transaksi: kantorTrans, program },
    });
  } catch (err) {
    return toErrorResponse('options', err);
  }
}
