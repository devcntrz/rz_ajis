/**
 * GET/PUT/DELETE /api/anakjuara/pg/ref/desa/{id} — single Data
 * Desa/Kelurahan record, keyed by the surrogate numeric `id`.
 *
 * PUT excludes `desaid` (generated, immutable). Changing `camatid` via PUT
 * re-denormalizes propid/kabid but does not regenerate desaid.
 * DELETE (Super Admin only) has no ref_* child table to check — desa is the
 * leaf of the hierarchy.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { buildDesaWritable, isUniqueViolation, rowToDesaPg, DESA_DETAIL_COLUMNS } from '@/lib/refPg/fields';
import type { RefDesaPgInput } from '@/types/ref-pg';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

class KecamatanNotFoundError extends Error {
  constructor() {
    super('Kecamatan tidak ditemukan.');
    this.name = 'KecamatanNotFoundError';
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID desa tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${DESA_DETAIL_COLUMNS} FROM ref_desa d LEFT JOIN ref_kecamatan c ON c.camatid = d.camatid WHERE d.id = $1 LIMIT 1`,
      [parsedId],
    );
    if (!row) {
      return NextResponse.json({ error: 'Desa tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: rowToDesaPg(row) });
  } catch (err) {
    console.error('[pg ref desa detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data desa.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.idGroupUser !== 1) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat mengubah data desa.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID desa tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>('SELECT id FROM ref_desa WHERE id = $1', [parsedId]);
    if (!existing) {
      return NextResponse.json({ error: 'Desa tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const body = (await req.json()) as RefDesaPgInput;
    if (Object.prototype.hasOwnProperty.call(body, 'namaDesa') && !body.namaDesa?.trim()) {
      return NextResponse.json({ error: 'Nama desa/kelurahan tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }

    let patch: RefDesaPgInput = { ...body };
    let namaKecamatanOverride: string | undefined;
    if (Object.prototype.hasOwnProperty.call(body, 'camatid')) {
      const camatid = body.camatid?.trim();
      if (!camatid) {
        return NextResponse.json({ error: 'Kecamatan tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
      }
      const kecamatan = await queryOne<{ kabid: string; nama_kecamatan: string }>(
        'SELECT kabid, nama_kecamatan FROM ref_kecamatan WHERE camatid = $1',
        [camatid],
      );
      if (!kecamatan) throw new KecamatanNotFoundError();
      const kabupaten = await queryOne<{ propid: string }>('SELECT propid FROM ref_kabupaten WHERE kabid = $1', [kecamatan.kabid]);
      patch = { ...patch, camatid, kabid: kecamatan.kabid, propid: kabupaten?.propid ?? null };
      namaKecamatanOverride = kecamatan.nama_kecamatan;
    }

    const { columns, placeholders, values } = buildDesaWritable(patch, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');
    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ref_desa SET ${setClause} WHERE id = $1 RETURNING *`,
      [parsedId, ...values],
    );

    let namaKecamatan = namaKecamatanOverride ?? null;
    if (namaKecamatan === null) {
      const kecamatan = await queryOne<{ nama_kecamatan: string }>('SELECT nama_kecamatan FROM ref_kecamatan WHERE camatid = $1', [rows[0].camatid]);
      namaKecamatan = kecamatan?.nama_kecamatan ?? null;
    }

    return NextResponse.json({ data: rowToDesaPg({ ...rows[0], nama_kecamatan: namaKecamatan }) });
  } catch (err) {
    if (err instanceof KecamatanNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'KECAMATAN_NOT_FOUND' }, { status: 404 });
    }
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Nama desa sudah digunakan.', code: 'DUPLICATE_DESA' }, { status: 409 });
    }
    console.error('[pg ref desa update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data desa.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.idGroupUser !== 1) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat menghapus data desa.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID desa tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>('SELECT id FROM ref_desa WHERE id = $1', [parsedId]);
    if (!existing) {
      return NextResponse.json({ error: 'Desa tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Desa is the leaf of the ref_* hierarchy — no ref_* child table to check.
    const affected = await execute('DELETE FROM ref_desa WHERE id = $1', [parsedId]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Desa tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id: parsedId } });
  } catch (err) {
    console.error('[pg ref desa delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data desa.' }, { status: 500 });
  }
}
