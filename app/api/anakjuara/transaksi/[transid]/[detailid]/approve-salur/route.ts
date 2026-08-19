/**
 * POST …/approve-salur — set the salur period (legacy `m=UpdateApproveSalur`).
 *
 * Destructive by design: saving wipes every existing split for this transaction, because
 * changing the salur month invalidates an entry made against the previous one. The UI
 * must confirm this explicitly — legacy gave no warning at all.
 */
import { NextResponse } from 'next/server';
import { guard, parseDetailId, toErrorResponse } from '@/lib/transaksi/api';
import { approveSalur } from '@/lib/transaksi/mutations';
import { approveSalurPayload } from '@/lib/transaksi/schema';

interface Ctx {
  params: Promise<{ transid: string; detailid: string }>;
}

export async function POST(req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { transid, detailid } = await params;
    const body = approveSalurPayload.parse(await req.json());

    const result = await approveSalur(
      decodeURIComponent(transid),
      parseDetailId(detailid),
      body,
      g.session,
    );

    return NextResponse.json({
      data: { ok: true, ...result },
      message: result.deleted_entries > 0
        ? `Approve salur tersimpan. ${result.deleted_entries} baris entry lama dihapus — silakan Entry Cashflow ulang.`
        : 'Approve salur tersimpan.',
    });
  } catch (err) {
    return toErrorResponse('approve-salur', err);
  }
}
