/**
 * GET /api/anakjuara/calon-anak-juara/{id}/pdf-cv
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { CajPdfLookupError, loadCajPdfRow } from '@/lib/pdf/cajPdfData';
import { renderCajCvHtml } from '@/lib/pdf/cajCvTemplate';
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
    const html = renderCajCvHtml(data);
    const pdf = await renderHtmlToPdf(html, { waitUntil: 'networkidle0' });

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="cv-caj-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof CajPdfLookupError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[calon-anak-juara pdf-cv]', err);
    return NextResponse.json({ error: 'Gagal merender PDF CV.' }, { status: 500 });
  }
}
