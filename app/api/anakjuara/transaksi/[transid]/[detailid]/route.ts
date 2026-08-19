/**
 * GET    /api/anakjuara/transaksi/{transid}/{detailid} — one transaction (legacy `m=v`)
 * DELETE /api/anakjuara/transaksi/{transid}/{detailid} — permanent delete (legacy `m=de`)
 */
import { NextResponse } from 'next/server';
import { guard, parseDetailId, requireAdmin, toErrorResponse } from '@/lib/transaksi/api';
import { fetchTransaksi } from '@/lib/transaksi/queries';
import { deleteTransaksiPerm } from '@/lib/transaksi/mutations';

interface Ctx {
  params: Promise<{ transid: string; detailid: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { transid, detailid } = await params;
    const row = await fetchTransaksi(
      decodeURIComponent(transid),
      parseDetailId(detailid),
      g.session,
    );

    if (!row) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau di luar akses Anda.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: row });
  } catch (err) {
    return toErrorResponse('detail', err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const denied = requireAdmin(g.session);
    if (denied) return denied;

    const { transid, detailid } = await params;
    const result = await deleteTransaksiPerm(
      decodeURIComponent(transid),
      parseDetailId(detailid),
      g.session,
    );

    return NextResponse.json({
      data: { ok: true, ...result },
      message: `Transaksi dihapus permanen beserta ${result.deleted_entries} baris input donasi.`,
    });
  } catch (err) {
    return toErrorResponse('delete-perm', err);
  }
}
