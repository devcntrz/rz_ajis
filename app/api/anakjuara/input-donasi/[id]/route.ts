import { NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { RuleError } from '@/lib/transaksi/rules';
import { deleteInputDonasiRow } from '@/lib/input-donasi/mutations';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { id } = await params;
    const idInputDonasi = Number(id);
    if (!Number.isInteger(idInputDonasi) || idInputDonasi <= 0) {
      throw new RuleError('ID input donasi tidak valid.');
    }

    const result = await deleteInputDonasiRow(idInputDonasi, g.session);
    return NextResponse.json({ message: 'Baris donasi dihapus.', ...result });
  } catch (err) {
    return toErrorResponse('input-donasi delete', err);
  }
}
