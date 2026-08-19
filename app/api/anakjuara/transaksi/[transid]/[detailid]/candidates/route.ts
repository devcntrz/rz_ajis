/**
 * GET …/candidates?qty=1 — children eligible to receive part of this transaction.
 *
 * Replaces legacy `m=anak` (Penyaluran_ReadAnak), which called getHargaProgram() twice
 * per child; the price now comes from one LEFT JOIN inside the same query.
 */
import { NextResponse } from 'next/server';
import { guard, parseDetailId, toErrorResponse } from '@/lib/transaksi/api';
import { fetchCandidates, fetchTransaksi } from '@/lib/transaksi/queries';
import { assertSalurPeriodSet } from '@/lib/transaksi/rules';

interface Ctx {
  params: Promise<{ transid: string; detailid: string }>;
}

export async function GET(req: Request, { params }: Ctx) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { transid, detailid } = await params;
    const trx = await fetchTransaksi(
      decodeURIComponent(transid),
      parseDetailId(detailid),
      g.session,
    );

    if (!trx) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau di luar akses Anda.' },
        { status: 404 },
      );
    }

    // Splits are stamped with the salur period, so candidates can only be listed once
    // that period exists.
    assertSalurPeriodSet(trx);

    const qtyRaw = Number(new URL(req.url).searchParams.get('qty') ?? '1');
    const qty = Number.isInteger(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;

    const rows = await fetchCandidates({
      idDonatur:   trx.did,
      namaProgram: trx.nama_program,
      tahun:       String(trx.tahun_salur).trim(),
      qty,
    });

    return NextResponse.json({
      data: rows,
      // Echoed back so the form can explain an empty result rather than just showing
      // "no data" — a name/year mismatch is the usual cause.
      criteria: {
        id_donatur:  trx.did,
        program:     trx.nama_program,
        tahun:       String(trx.tahun_salur).trim(),
        qty,
      },
      transaksi: trx,
    });
  } catch (err) {
    return toErrorResponse('candidates', err);
  }
}
