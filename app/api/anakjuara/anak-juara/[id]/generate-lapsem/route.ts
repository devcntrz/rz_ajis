/**
 * POST /api/anakjuara/anak-juara/{id}/generate-lapsem — "Generate Lapsem" action
 * button on the Anak Juara page. Inserts a `manual_laporan` row for this anak +
 * the active semester (`ajis_semester WHERE onprogress='y'`), idempotent: a
 * second call for the same anak+semester returns the existing laporanid.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { insertManualLaporan } from '@/lib/laporanSemester/queries';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { laporanid, created } = await insertManualLaporan(id, session);

    return NextResponse.json({ data: { laporanid, created } });
  } catch (err) {
    console.error('[generate-lapsem]', err);
    const message = err instanceof Error ? err.message : 'Gagal membuat laporan semester.';
    return NextResponse.json({ error: message, code: 'RULE' }, { status: 400 });
  }
}
