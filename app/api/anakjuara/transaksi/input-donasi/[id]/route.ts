/**
 * DELETE /api/anakjuara/transaksi/input-donasi/{id} — remove one split row
 * (legacy `m=delete_donasi`), then recompute the parent transaction's rollup.
 */
import { NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { deleteInputDonasi } from '@/lib/transaksi/mutations';
import { RuleError } from '@/lib/transaksi/rules';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { id } = await params;
    const idInputDonasi = Number(id);
    if (!Number.isInteger(idInputDonasi) || idInputDonasi <= 0) {
      throw new RuleError('id_input_donasi tidak valid.');
    }

    const result = await deleteInputDonasi(idInputDonasi, g.session);

    return NextResponse.json({
      data: { ok: true, ...result },
      message: 'Baris input donasi dihapus.',
    });
  } catch (err) {
    return toErrorResponse('delete-input-donasi', err);
  }
}
