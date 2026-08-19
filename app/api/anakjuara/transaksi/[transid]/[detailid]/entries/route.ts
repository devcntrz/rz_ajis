/**
 * Entry / Update Cashflow — the module's critical path.
 *
 * GET    …/entries — saved splits (legacy `m=r_kantor_update`)
 * PUT    …/entries — save splits. Replaces legacy `c_kantor_ganjil`, `c_kantor_genap`,
 *                    `u_kantor_ganjil`, `u_kantor_genap`, `c_kantor`, `u_kantor_update`.
 *                    The semester is derived server-side from the transaction's own
 *                    `bulan_salur`, so the browser can no longer pick the wrong one.
 * DELETE …/entries — clear all splits and reset the rollup (legacy `m=d`)
 *
 * The payload travels in the request body. Legacy sent the whole grid as
 * `&data=<JSON>` on the query string, which silently truncated for donors with hundreds
 * of children.
 */
import { NextResponse } from 'next/server';
import { guard, parseDetailId, toErrorResponse } from '@/lib/transaksi/api';
import { fetchEntries, fetchTransaksi } from '@/lib/transaksi/queries';
import { deleteEntries, saveEntries } from '@/lib/transaksi/mutations';
import { entriesPayload } from '@/lib/transaksi/schema';

interface Ctx {
  params: Promise<{ transid: string; detailid: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { transid: rawTransid, detailid: rawDetailid } = await params;
    const transid = decodeURIComponent(rawTransid);
    const detailid = parseDetailId(rawDetailid);

    // Scope is enforced on the parent transaction, not on the split rows, so a branch
    // cannot read another branch's entries by walking the URL.
    const trx = await fetchTransaksi(transid, detailid, g.session);
    if (!trx) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau di luar akses Anda.' },
        { status: 404 },
      );
    }

    const rows = await fetchEntries(transid, detailid);
    const total = rows.reduce((sum, r) => sum + Number(r.nominal_donasi || 0), 0);

    return NextResponse.json({
      data: rows,
      footer: {
        total_nominal_donasi: total,
        perkiraan_rp:         Number(trx.perkiraan_rp),
        selisih:              Math.round(Number(trx.perkiraan_rp)) - Math.round(total),
      },
      transaksi: trx,
    });
  } catch (err) {
    return toErrorResponse('entries list', err);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { transid, detailid } = await params;
    const body = entriesPayload.parse(await req.json());

    const result = await saveEntries(
      decodeURIComponent(transid),
      parseDetailId(detailid),
      body,
      g.session,
    );

    return NextResponse.json({
      data: { ok: true, ...result },
      message: `Cashflow tersimpan: ${result.rows_inserted} anak, periode ${result.periode}.`,
    });
  } catch (err) {
    return toErrorResponse('entries save', err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { transid, detailid } = await params;
    const result = await deleteEntries(
      decodeURIComponent(transid),
      parseDetailId(detailid),
      g.session,
    );

    return NextResponse.json({
      data: { ok: true, ...result },
      message: `${result.deleted} baris input donasi dihapus.`,
    });
  } catch (err) {
    return toErrorResponse('entries delete', err);
  }
}
