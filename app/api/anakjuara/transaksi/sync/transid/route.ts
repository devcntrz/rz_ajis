/**
 * GET/POST /api/anakjuara/transaksi/sync/transid — Get Transid / Get Transid by tgl
 * (legacy `get_transaksi_api.php` search + `m=c_transidget` commit).
 *
 * Admin-only, matching where these buttons lived on the legacy TransaksiAdmin page.
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, requireAdmin, toErrorResponse } from '@/lib/transaksi/api';
import { searchTransidCandidates, commitTransidRows } from '@/lib/transaksi/sync';
import { syncTransidSearchQuery, syncTransidCommitPayload, searchParamsToObject } from '@/lib/transaksi/schema';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;
    const forbidden = requireAdmin(g.session);
    if (forbidden) return forbidden;

    const query = syncTransidSearchQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const { data, total } = await searchTransidCandidates(query);

    return NextResponse.json({ data, total, page: query.page });
  } catch (err) {
    return toErrorResponse('sync-transid-search', err);
  }
}

export async function POST(req: Request) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;
    const forbidden = requireAdmin(g.session);
    if (forbidden) return forbidden;

    const body = syncTransidCommitPayload.parse(await req.json());
    const result = await commitTransidRows(body, g.session);

    return NextResponse.json({
      data: { ok: true, ...result },
      message: `${result.count} transaksi berhasil disinkronkan.`,
    });
  } catch (err) {
    return toErrorResponse('sync-transid-commit', err);
  }
}
