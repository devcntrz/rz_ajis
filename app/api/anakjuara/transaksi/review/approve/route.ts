/**
 * POST /api/anakjuara/transaksi/review/approve — bulk approve from the Review tab
 * (legacy `m=UpdateApproveSalurReview`).
 *
 * Keyed on `transaksi.id_review` = CONCAT(transid, detailid).
 */
import { NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { approveReviewBulk } from '@/lib/transaksi/mutations';
import { reviewApprovePayload } from '@/lib/transaksi/schema';

export async function POST(req: Request) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const body = reviewApprovePayload.parse(await req.json());
    const result = await approveReviewBulk(body, g.session);

    if (result.updated === 0) {
      return NextResponse.json(
        { error: 'Tidak ada transaksi yang diperbarui — mungkin di luar akses Anda.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { ok: true, ...result },
      message: `${result.updated} transaksi berhasil di-review dan di-approve salur.`,
    });
  } catch (err) {
    return toErrorResponse('review-approve', err);
  }
}
