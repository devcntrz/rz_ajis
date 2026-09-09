/**
 * GET/PUT/DELETE /api/anakjuara/pg/kantor/{id} — single Master Kantor record.
 *
 * Keyed by the surrogate numeric `id` — the URL param — while `oid` is the
 * natural/business key every other table's FK points at (ajis_anak.kantor_id,
 * ajis_wilayah_pembinaan.kantor_id, ...) and stays immutable-by-convention on
 * write (mirrors idAnak in app/api/anakjuara/pg/anak/[id]/route.ts).
 *
 * No row-level scoping: `ajis_kantor` is global master data, so any
 * authenticated session may GET, but PUT/DELETE are Super Admin only
 * (id_group_user === 1).
 *
 * DELETE is a hard delete, but only after checking no other table still
 * references this kantor's `oid` — ajis_wilayah_pembinaan.kantor_id and
 * ajis_anak.kantor_id both FK onto it, and there is no DB-level ON DELETE
 * CASCADE to rely on, so an in-use kantor is refused with 409 IN_USE instead.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { KANTOR_DETAIL_COLUMNS, buildWritable, isUniqueViolation, rowToKantorPg } from '@/lib/kantorPg/fields';
import type { AjisKantorPgInput } from '@/types/kantor-pg';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const kantorId = parseId(id);
    if (kantorId === null) {
      return NextResponse.json({ error: 'ID kantor tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${KANTOR_DETAIL_COLUMNS} FROM ajis_kantor k WHERE k.id = $1 LIMIT 1`,
      [kantorId],
    );
    if (!row) {
      return NextResponse.json({ error: 'Kantor tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: rowToKantorPg(row) });
  } catch (err) {
    console.error('[pg kantor detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data kantor.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.idGroupUser !== 1) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat mengubah data kantor.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const kantorId = parseId(id);
    if (kantorId === null) {
      return NextResponse.json({ error: 'ID kantor tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM ajis_kantor WHERE id = $1',
      [kantorId],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Kantor tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const body = (await req.json()) as AjisKantorPgInput;
    if (Object.prototype.hasOwnProperty.call(body, 'kantor') && !body.kantor?.trim()) {
      return NextResponse.json({ error: 'kantor tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }

    const { columns, placeholders, values } = buildWritable(body, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');

    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ajis_kantor SET ${setClause} WHERE id = $1 RETURNING *`,
      [kantorId, ...values],
    );

    return NextResponse.json({ data: rowToKantorPg(rows[0]) });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: 'oid sudah digunakan.', code: 'DUPLICATE_OID' },
        { status: 409 },
      );
    }
    console.error('[pg kantor update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data kantor.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.idGroupUser !== 1) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat menghapus data kantor.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const kantorId = parseId(id);
    if (kantorId === null) {
      return NextResponse.json({ error: 'ID kantor tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ oid: string }>(
      'SELECT oid FROM ajis_kantor WHERE id = $1',
      [kantorId],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Kantor tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const usedByWilayah = await queryOne<{ id: number }>(
      'SELECT id FROM ajis_wilayah_pembinaan WHERE kantor_id = $1 LIMIT 1',
      [existing.oid],
    );
    const usedByAnak = usedByWilayah
      ? null
      : await queryOne<{ id: number }>(
          'SELECT id FROM ajis_anak WHERE kantor_id = $1 LIMIT 1',
          [existing.oid],
        );
    if (usedByWilayah || usedByAnak) {
      return NextResponse.json({ error: 'Kantor masih digunakan', code: 'IN_USE' }, { status: 409 });
    }

    const affected = await execute('DELETE FROM ajis_kantor WHERE id = $1', [kantorId]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Kantor tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id: kantorId } });
  } catch (err) {
    console.error('[pg kantor delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data kantor.' }, { status: 500 });
  }
}
