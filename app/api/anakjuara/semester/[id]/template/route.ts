/**
 * POST /api/anakjuara/semester/{id}/template — upload one or more of the 13
 * template image sections (multipart/form-data, one field per section, field
 * names match `SEMESTER_TEMPLATE_FIELDS`). Each provided field is uploaded to
 * Vercel Blob and the matching `ajis_semester` column is updated with the URL.
 */
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession, requireGroup12 } from '@/lib/auth';
import { fetchSemesterById, updateSemesterTemplateField } from '@/lib/semester/queries';
import { SEMESTER_TEMPLATE_FIELDS } from '@/types/semester';
import type { SemesterTemplateField } from '@/types/semester';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Hanya Admin/SpMD Cabang yang dapat mengubah template semester.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'id tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const semester = await fetchSemesterById(id);
    if (!semester) {
      return NextResponse.json({ error: 'Semester tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const form = await req.formData();
    const updated: Partial<Record<SemesterTemplateField, string>> = {};

    for (const field of SEMESTER_TEMPLATE_FIELDS) {
      const file = form.get(field);
      if (!(file instanceof File) || file.size === 0) continue;

      const arrayBuffer = await file.arrayBuffer();
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
      const blob = await put(
        `semester-template/${semester.semesterid}/${field}-${Date.now()}.${ext}`,
        Buffer.from(arrayBuffer),
        { access: 'public', contentType: file.type || 'application/octet-stream' },
      );

      await updateSemesterTemplateField(id, field, blob.url);
      updated[field] = blob.url;
    }

    if (Object.keys(updated).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada file template yang dikirim.', code: 'VALIDATION' },
        { status: 400 },
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error('[semester template upload]', err);
    return NextResponse.json({ error: 'Gagal upload template semester.' }, { status: 500 });
  }
}
