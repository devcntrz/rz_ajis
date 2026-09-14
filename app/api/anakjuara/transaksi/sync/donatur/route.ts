/**
 * GET/POST /api/anakjuara/transaksi/sync/donatur — Get Donatur
 * (legacy `get_donatur_api.php` search + `m=c_didget` commit).
 *
 * Admin-only, matching where this button lived on the legacy TransaksiAdmin page.
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, requireAdmin, toErrorResponse } from '@/lib/transaksi/api';
import { searchDonaturCandidates, commitDonaturRows } from '@/lib/transaksi/sync';
import { syncDonaturSearchQuery, syncDonaturCommitPayload, searchParamsToObject } from '@/lib/transaksi/schema';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;
    const forbidden = requireAdmin(g.session);
    if (forbidden) return forbidden;

    const query = syncDonaturSearchQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const { data, total } = await searchDonaturCandidates(query);

    return NextResponse.json({ data, total, page: query.page });
  } catch (err) {
    return toErrorResponse('sync-donatur-search', err);
  }
}

export async function POST(req: Request) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;
    const forbidden = requireAdmin(g.session);
    if (forbidden) return forbidden;

    const body = syncDonaturCommitPayload.parse(await req.json());
    const result = await commitDonaturRows(body, g.session);

    return NextResponse.json({
      data: { ok: true, ...result },
      message: `${result.count} donatur berhasil disinkronkan.`,
    });
  } catch (err) {
    return toErrorResponse('sync-donatur-commit', err);
  }
}
