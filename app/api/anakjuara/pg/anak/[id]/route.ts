/**
 * GET/PUT/DELETE /api/anakjuara/pg/anak/{id} — single Pengajuan Beasiswa record.
 *
 * Keyed by the natural/business key `id_anak` (varchar, NOT NULL UNIQUE) per
 * CLAUDE.md §2.1 — NOT the numeric identity `id`, which stays an internal
 * surrogate every other table's FK points at.
 *
 * Delete is a soft delete: `ajis_anak.aktif` (boolean) already exists for exactly
 * this purpose (mirrors the legacy `aktif = 'y'` filter the MySQL /anak routes use),
 * so DELETE sets aktif = false rather than removing the row — other tables
 * (ajis_data_prestasi, pemasangan, penilaian, …) hold FKs onto id_anak, so a hard
 * delete would either cascade destructively or fail on the constraint.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession, type SessionData } from '@/lib/auth';
import { ANAK_DETAIL_COLUMNS, buildWritable, rowToAnakPg } from '@/lib/anakPg/fields';
import type { AnakPgInput } from '@/types/anak-pg';

type ScopeRow = { kantor_id: string | null; id_wilayah_pembinaan: number | null };

/** True when the session's role scope covers this row (§2.1a role scoping). */
function inScope(session: SessionData, row: ScopeRow): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return row.kantor_id === session.idKantor;
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
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

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${ANAK_DETAIL_COLUMNS} FROM ajis_anak a WHERE a.id_anak = $1 LIMIT 1`,
      [id],
    );
    if (!row) {
      return NextResponse.json({ error: 'Anak tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, { kantor_id: row.kantor_id as string | null, id_wilayah_pembinaan: row.id_wilayah_pembinaan as number | null })) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ data: rowToAnakPg(row) });
  } catch (err) {
    console.error('[pg anak detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data anak.' }, { status: 500 });
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

    const { id } = await params;

    const existing = await queryOne<ScopeRow>(
      'SELECT kantor_id, id_wilayah_pembinaan FROM ajis_anak WHERE id_anak = $1',
      [id],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Anak tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = (await req.json()) as AnakPgInput;
    if (Object.prototype.hasOwnProperty.call(body, 'namaLengkap') && !body.namaLengkap?.trim()) {
      return NextResponse.json({ error: 'nama_lengkap tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }

    const { columns, placeholders, values } = buildWritable(body, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');

    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ajis_anak SET ${setClause} WHERE id_anak = $1 RETURNING *`,
      [id, ...values],
    );

    return NextResponse.json({ data: rowToAnakPg(rows[0]) });
  } catch (err) {
    console.error('[pg anak update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data anak.' }, { status: 500 });
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

    const { id } = await params;

    const existing = await queryOne<ScopeRow>(
      'SELECT kantor_id, id_wilayah_pembinaan FROM ajis_anak WHERE id_anak = $1',
      [id],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Anak tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const affected = await execute('UPDATE ajis_anak SET aktif = false WHERE id_anak = $1', [id]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Anak tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id_anak: id } });
  } catch (err) {
    console.error('[pg anak delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data anak.' }, { status: 500 });
  }
}
