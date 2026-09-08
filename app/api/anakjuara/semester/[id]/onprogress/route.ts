/**
 * POST /api/anakjuara/semester/{id}/onprogress — toggle the active semester.
 * Activating one clears `onprogress` on all others (see lib/semester/queries.ts
 * for why this differs from legacy's un-exclusive `ImportTarget_Onprogress`).
 */
import { NextResponse } from 'next/server';
import { getSession, requireGroup12 } from '@/lib/auth';
import { fetchSemesterById, setOnprogress } from '@/lib/semester/queries';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Hanya Admin/SpMD Cabang yang dapat mengubah semester aktif.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'id tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await fetchSemesterById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Semester tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    let onprogress: 'y' | 'n' = 'y';
    try {
      const body = await req.json() as { onprogress?: 'y' | 'n' };
      if (body?.onprogress === 'n') onprogress = 'n';
    } catch {
      // No body sent — default to activating (the common case for this button).
    }

    await setOnprogress(id, onprogress);
    return NextResponse.json({ data: { id, onprogress } });
  } catch (err) {
    console.error('[semester onprogress]', err);
    return NextResponse.json({ error: 'Gagal mengubah status semester aktif.' }, { status: 500 });
  }
}
