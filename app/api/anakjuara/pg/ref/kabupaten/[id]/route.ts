/**
 * GET/PUT/DELETE /api/anakjuara/pg/ref/kabupaten/{id} — single Data
 * Kabupaten record, keyed by the surrogate numeric `id`.
 *
 * PUT excludes `kabid` (generated, immutable). Changing `propid` via PUT is
 * allowed (it's a normal FK column, only the generated kabid itself is
 * locked) but does not regenerate kabid.
 * DELETE (Super Admin only) refuses 409 IN_USE when any ref_kecamatan row
 * still references this kabupaten's kabid.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { buildKabupatenWritable, isUniqueViolation, rowToKabupatenPg, KABUPATEN_DETAIL_COLUMNS } from '@/lib/refPg/fields';
import type { RefKabupatenPgInput } from '@/types/ref-pg';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

class PropinsiNotFoundError extends Error {
  constructor() {
    super('Propinsi tidak ditemukan.');
    this.name = 'PropinsiNotFoundError';
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
      return NextResponse.json({ error: 'ID kabupaten tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${KABUPATEN_DETAIL_COLUMNS} FROM ref_kabupaten k LEFT JOIN ref_propinsi p ON p.propid = k.propid WHERE k.id = $1 LIMIT 1`,
      [parsedId],
    );
    if (!row) {
      return NextResponse.json({ error: 'Kabupaten tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: rowToKabupatenPg(row) });
  } catch (err) {
    console.error('[pg ref kabupaten detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data kabupaten.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat mengubah data kabupaten.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID kabupaten tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>('SELECT id FROM ref_kabupaten WHERE id = $1', [parsedId]);
    if (!existing) {
      return NextResponse.json({ error: 'Kabupaten tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const body = (await req.json()) as RefKabupatenPgInput;
    if (Object.prototype.hasOwnProperty.call(body, 'kabupaten') && !body.kabupaten?.trim()) {
      return NextResponse.json({ error: 'Nama kabupaten tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }
    if (Object.prototype.hasOwnProperty.call(body, 'propid')) {
      const propid = body.propid?.trim();
      if (!propid) {
        return NextResponse.json({ error: 'Propinsi tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
      }
      const propinsi = await queryOne<{ propid: string }>('SELECT propid FROM ref_propinsi WHERE propid = $1', [propid]);
      if (!propinsi) throw new PropinsiNotFoundError();
    }

    const { columns, placeholders, values } = buildKabupatenWritable(body, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');
    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ref_kabupaten SET ${setClause} WHERE id = $1 RETURNING *`,
      [parsedId, ...values],
    );

    const propinsiRow = await queryOne<{ propinsi: string }>('SELECT propinsi FROM ref_propinsi WHERE propid = $1', [rows[0].propid]);

    return NextResponse.json({ data: rowToKabupatenPg({ ...rows[0], nama_propinsi: propinsiRow?.propinsi ?? null }) });
  } catch (err) {
    if (err instanceof PropinsiNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'PROPINSI_NOT_FOUND' }, { status: 404 });
    }
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Nama kabupaten sudah digunakan.', code: 'DUPLICATE_KABUPATEN' }, { status: 409 });
    }
    console.error('[pg ref kabupaten update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data kabupaten.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menghapus data kabupaten.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID kabupaten tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number; kabid: string }>('SELECT id, kabid FROM ref_kabupaten WHERE id = $1', [parsedId]);
    if (!existing) {
      return NextResponse.json({ error: 'Kabupaten tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const usedByKecamatan = await queryOne<{ id: number }>('SELECT id FROM ref_kecamatan WHERE kabid = $1 LIMIT 1', [existing.kabid]);
    if (usedByKecamatan) {
      return NextResponse.json({ error: 'Kabupaten masih digunakan oleh data kecamatan.', code: 'IN_USE' }, { status: 409 });
    }

    const affected = await execute('DELETE FROM ref_kabupaten WHERE id = $1', [parsedId]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Kabupaten tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id: parsedId } });
  } catch (err) {
    console.error('[pg ref kabupaten delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data kabupaten.' }, { status: 500 });
  }
}
