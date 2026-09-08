/**
 * PUT/DELETE /api/anakjuara/semester/{id} — admin CRUD for one ajis_semester row.
 */
import { NextResponse } from 'next/server';
import { getSession, requireGroup12 } from '@/lib/auth';
import { fetchSemesterById, updateSemester, deleteSemester } from '@/lib/semester/queries';
import type { SemesterInput } from '@/types/semester';

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Hanya Admin/SpMD Cabang yang dapat mengubah semester.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: 'id tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await fetchSemesterById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Semester tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const body = await req.json() as Partial<SemesterInput>;
    if (!body.semesterid || !body.semester || !body.tgl_awal || !body.tgl_akhir) {
      return NextResponse.json(
        { error: 'semesterid, semester, tgl_awal, tgl_akhir wajib diisi.', code: 'VALIDATION' },
        { status: 400 },
      );
    }

    await updateSemester(id, {
      semesterid: body.semesterid,
      semester:   body.semester,
      tgl_awal:   body.tgl_awal,
      tgl_akhir:  body.tgl_akhir,
      onprogress: body.onprogress === 'y' ? 'y' : existing.onprogress,
    });

    return NextResponse.json({ data: { id } });
  } catch (err) {
    console.error('[semester update]', err);
    return NextResponse.json({ error: 'Gagal mengubah semester.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Hanya Admin/SpMD Cabang yang dapat menghapus semester.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: 'id tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    await deleteSemester(id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    console.error('[semester delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus semester.' }, { status: 500 });
  }
}
