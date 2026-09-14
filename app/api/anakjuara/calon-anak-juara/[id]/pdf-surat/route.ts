/**
 * GET /api/anakjuara/calon-anak-juara/{id}/pdf-surat
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { CajPdfLookupError, loadCajPdfRow } from '@/lib/pdf/cajPdfData';
import { renderCajSuratHtml } from '@/lib/pdf/cajSuratTemplate';
import { renderHtmlToPdf } from '@/lib/pdf/browser';

export const maxDuration = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await loadCajPdfRow(session, id);
    const html = renderCajSuratHtml(data);
    const pdf = await renderHtmlToPdf(html, { waitForNetworkIdle: true });

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="surat-caj-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof CajPdfLookupError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[calon-anak-juara pdf-surat]', err);
    return NextResponse.json({ error: 'Gagal merender PDF surat.' }, { status: 500 });
  }
}
