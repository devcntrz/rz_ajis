/**
 * POST /api/anakjuara/anak/[id]/foto — Upload/replace an anak's profile photo.
 * multipart/form-data, single file under field name "foto". Uploaded to
 * Vercel Blob and saved to ajis_anak.foto immediately (independent of the
 * rest of the profile form), following the pattern in
 * app/api/anakjuara/semester/[id]/template/route.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

const MAX_SIZE = 5 * 1024 * 1024;

function inScope(session: Awaited<ReturnType<typeof getSession>>, row: { id_wilayah_pembinaan: number | null; kantor_id: string | null }): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return String(row.kantor_id ?? '') === String(session.idKantor);
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await queryOne<{ id_wilayah_pembinaan: number | null; kantor_id: string | null }>(
      'SELECT id_wilayah_pembinaan, kantor_id FROM ajis_anak WHERE id_anak = ? LIMIT 1',
      [id],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Anak tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses untuk mengubah data anak ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get('foto');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'File foto tidak ditemukan.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File harus berupa gambar.', code: 'VALIDATION' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB.', code: 'VALIDATION' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const blob = await put(
      `anak/${id}/foto-${Date.now()}.${ext}`,
      Buffer.from(arrayBuffer),
      { access: 'public', contentType: file.type },
    );

    await execute('UPDATE ajis_anak SET foto = ? WHERE id_anak = ?', [blob.url, id]);

    return NextResponse.json({ data: { foto: blob.url } });
  } catch (err) {
    console.error('[anak foto upload]', err);
    return NextResponse.json({ error: 'Gagal mengunggah foto.' }, { status: 500 });
  }
}
