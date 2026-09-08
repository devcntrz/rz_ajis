/**
 * POST /api/anakjuara/laporan-semester/{laporanid}/approve — render the PDF via
 * Puppeteer, upload it to Vercel Blob, then stamp `manual_laporan` with the
 * resulting URL (analog of legacy `updateManualLaporan()`, which stored the
 * generated PDF's filename in `id_program_postgree`).
 */
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession, requireGroup12 } from '@/lib/auth';
import { assembleManualLaporanData } from '@/lib/manualLaporan/pdf';
import { renderLapsemHtml } from '@/lib/pdf/lapsemTemplate';
import { renderHtmlToPdf } from '@/lib/pdf/browser';
import { approveLapsem } from '@/lib/laporanSemester/queries';

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ laporanid: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Hanya Admin/SpMD Cabang yang dapat approve laporan semester.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { laporanid } = await params;
    const data = await assembleManualLaporanData(laporanid);
    const html = renderLapsemHtml(data);
    const pdf = await renderHtmlToPdf(html);

    const blob = await put(`lapsem/${laporanid}-${Date.now()}.pdf`, pdf, {
      access: 'public',
      contentType: 'application/pdf',
    });

    await approveLapsem(laporanid, blob.url);

    return NextResponse.json({ data: { laporanid, url: blob.url } });
  } catch (err) {
    console.error('[laporan-semester approve]', err);
    const message = err instanceof Error ? err.message : 'Gagal approve laporan semester.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
