/**
 * GET/PUT/DELETE /api/anakjuara/pg/ref/kecamatan/{id} — single Data
 * Kecamatan record, keyed by the surrogate numeric `id`.
 *
 * PUT excludes `camatid` (generated, immutable). DELETE (Super Admin only)
 * refuses 409 IN_USE when any ref_desa row still references this
 * kecamatan's camatid.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { buildKecamatanWritable, isUniqueViolation, rowToKecamatanPg, KECAMATAN_DETAIL_COLUMNS } from '@/lib/refPg/fields';
import type { RefKecamatanPgInput } from '@/types/ref-pg';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

class KabupatenNotFoundError extends Error {
  constructor() {
    super('Kabupaten tidak ditemukan.');
    this.name = 'KabupatenNotFoundError';
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
      return NextResponse.json({ error: 'ID kecamatan tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${KECAMATAN_DETAIL_COLUMNS} FROM ref_kecamatan c LEFT JOIN ref_kabupaten k ON k.kabid = c.kabid WHERE c.id = $1 LIMIT 1`,
      [parsedId],
    );
    if (!row) {
      return NextResponse.json({ error: 'Kecamatan tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: rowToKecamatanPg(row) });
  } catch (err) {
    console.error('[pg ref kecamatan detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data kecamatan.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat mengubah data kecamatan.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID kecamatan tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>('SELECT id FROM ref_kecamatan WHERE id = $1', [parsedId]);
    if (!existing) {
      return NextResponse.json({ error: 'Kecamatan tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const body = (await req.json()) as RefKecamatanPgInput;
    if (Object.prototype.hasOwnProperty.call(body, 'namaKecamatan') && !body.namaKecamatan?.trim()) {
      return NextResponse.json({ error: 'Nama kecamatan tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }
    let namaKabupatenOverride: string | undefined;
    if (Object.prototype.hasOwnProperty.call(body, 'kabid')) {
      const kabid = body.kabid?.trim();
      if (!kabid) {
        return NextResponse.json({ error: 'Kabupaten tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
      }
      const kabupaten = await queryOne<{ kabupaten: string }>('SELECT kabupaten FROM ref_kabupaten WHERE kabid = $1', [kabid]);
      if (!kabupaten) throw new KabupatenNotFoundError();
      namaKabupatenOverride = kabupaten.kabupaten;
    }

    const { columns, placeholders, values } = buildKecamatanWritable(body, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');
    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ref_kecamatan SET ${setClause} WHERE id = $1 RETURNING *`,
      [parsedId, ...values],
    );

    let namaKabupaten = namaKabupatenOverride ?? null;
    if (namaKabupaten === null) {
      const kabupaten = await queryOne<{ kabupaten: string }>('SELECT kabupaten FROM ref_kabupaten WHERE kabid = $1', [rows[0].kabid]);
      namaKabupaten = kabupaten?.kabupaten ?? null;
    }

    return NextResponse.json({ data: rowToKecamatanPg({ ...rows[0], nama_kabupaten: namaKabupaten }) });
  } catch (err) {
    if (err instanceof KabupatenNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'KABUPATEN_NOT_FOUND' }, { status: 404 });
    }
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Nama kecamatan sudah digunakan.', code: 'DUPLICATE_KECAMATAN' }, { status: 409 });
    }
    console.error('[pg ref kecamatan update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data kecamatan.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menghapus data kecamatan.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID kecamatan tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number; camatid: string }>('SELECT id, camatid FROM ref_kecamatan WHERE id = $1', [parsedId]);
    if (!existing) {
      return NextResponse.json({ error: 'Kecamatan tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const usedByDesa = await queryOne<{ id: number }>('SELECT id FROM ref_desa WHERE camatid = $1 LIMIT 1', [existing.camatid]);
    if (usedByDesa) {
      return NextResponse.json({ error: 'Kecamatan masih digunakan oleh data desa/kelurahan.', code: 'IN_USE' }, { status: 409 });
    }

    const affected = await execute('DELETE FROM ref_kecamatan WHERE id = $1', [parsedId]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Kecamatan tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id: parsedId } });
  } catch (err) {
    console.error('[pg ref kecamatan delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data kecamatan.' }, { status: 500 });
  }
}
