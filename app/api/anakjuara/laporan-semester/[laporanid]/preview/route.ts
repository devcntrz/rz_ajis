/**
 * GET /api/anakjuara/laporan-semester/{laporanid}/preview — real-render PDF
 * preview from live DB data (no save to Blob, no `manual_laporan` mutation).
 * Opened in a new tab from the Lapsem grid / the Anak Juara "Generate Lapsem"
 * action, per the plan's decision to render on-demand rather than caching a
 * generated file until the report is actually approved.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { assembleManualLaporanData } from '@/lib/manualLaporan/pdf';
import { renderLapsemHtml } from '@/lib/pdf/lapsemTemplate';
import { renderHtmlToPdf } from '@/lib/pdf/browser';

// Cold-start headroom for launching Chromium + rendering on Vercel serverless.
export const maxDuration = 60;

export async function GET(_req: Request, { params }: { params: Promise<{ laporanid: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { laporanid } = await params;
    const data = await assembleManualLaporanData(laporanid);
    const html = renderLapsemHtml(data);
    const pdf = await renderHtmlToPdf(html);

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="lapsem-${laporanid}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[laporan-semester preview]', err);
    const message = err instanceof Error ? err.message : 'Gagal merender PDF laporan semester.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
