/**
 * GET/PUT/DELETE /api/anakjuara/pg/ref/propinsi/{id} — single Data Propinsi
 * record, keyed by the surrogate numeric `id`.
 *
 * PUT excludes `propid` — codes are immutable once created (task brief).
 * DELETE (Super Admin only) refuses 409 IN_USE when any ref_kabupaten row
 * still references this propinsi's propid.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { buildPropinsiWritable, isUniqueViolation, rowToPropinsiPg, PROPINSI_DETAIL_COLUMNS } from '@/lib/refPg/fields';
import type { RefPropinsiPgInput } from '@/types/ref-pg';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
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
      return NextResponse.json({ error: 'ID propinsi tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${PROPINSI_DETAIL_COLUMNS} FROM ref_propinsi p WHERE p.id = $1 LIMIT 1`,
      [parsedId],
    );
    if (!row) {
      return NextResponse.json({ error: 'Propinsi tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: rowToPropinsiPg(row) });
  } catch (err) {
    console.error('[pg ref propinsi detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data propinsi.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat mengubah data propinsi.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID propinsi tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>('SELECT id FROM ref_propinsi WHERE id = $1', [parsedId]);
    if (!existing) {
      return NextResponse.json({ error: 'Propinsi tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const body = (await req.json()) as RefPropinsiPgInput;
    // propid is immutable — strip it even if the client sends it.
    const patch: RefPropinsiPgInput = { ...body };
    delete patch.propid;
    if (Object.prototype.hasOwnProperty.call(patch, 'propinsi') && !patch.propinsi?.trim()) {
      return NextResponse.json({ error: 'Nama propinsi tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }

    const { columns, placeholders, values } = buildPropinsiWritable(patch, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');
    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ref_propinsi SET ${setClause} WHERE id = $1 RETURNING *`,
      [parsedId, ...values],
    );

    return NextResponse.json({ data: rowToPropinsiPg(rows[0]) });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Nama propinsi sudah digunakan.', code: 'DUPLICATE_PROPINSI' }, { status: 409 });
    }
    console.error('[pg ref propinsi update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data propinsi.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menghapus data propinsi.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const parsedId = parseId(id);
    if (parsedId === null) {
      return NextResponse.json({ error: 'ID propinsi tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number; propid: string }>(
      'SELECT id, propid FROM ref_propinsi WHERE id = $1',
      [parsedId],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Propinsi tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const usedByKabupaten = await queryOne<{ id: number }>(
      'SELECT id FROM ref_kabupaten WHERE propid = $1 LIMIT 1',
      [existing.propid],
    );
    if (usedByKabupaten) {
      return NextResponse.json({ error: 'Propinsi masih digunakan oleh data kabupaten.', code: 'IN_USE' }, { status: 409 });
    }

    const affected = await execute('DELETE FROM ref_propinsi WHERE id = $1', [parsedId]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Propinsi tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id: parsedId } });
  } catch (err) {
    console.error('[pg ref propinsi delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data propinsi.' }, { status: 500 });
  }
}
