/**
 * PATCH  /api/anakjuara/penyaluran/{id}/rows/{idRow} — Edit baris (fitur baru, PRD §5.5).
 * DELETE /api/anakjuara/penyaluran/{id}/rows/{idRow} — Hapus baris (legacy delete/pengembalian).
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { RuleError } from '@/lib/transaksi/rules';
import { deleteRow, editRow } from '@/lib/penyaluran/mutations';
import { editRowPayload } from '@/lib/penyaluran/schema';

type Ctx = { params: Promise<{ idPenyaluran: string; idRow: string }> };

function parseIdRow(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new RuleError('id_row tidak valid.');
  return n;
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran, idRow } = await params;
    const body = editRowPayload.parse(await req.json());
    await editRow(idPenyaluran, parseIdRow(idRow), body);

    return NextResponse.json({ message: 'Baris penyaluran diperbarui.' });
  } catch (err) {
    return toErrorResponse('penyaluran edit row', err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran, idRow } = await params;
    await deleteRow(idPenyaluran, parseIdRow(idRow));

    return NextResponse.json({ message: 'Baris penyaluran dihapus.' });
  } catch (err) {
    return toErrorResponse('penyaluran delete row', err);
  }
}
