/**
 * GET/PUT/DELETE /api/anakjuara/pg/wilayah/{id} — single Data Wilayah record.
 *
 * Keyed by the surrogate numeric `id_wilayah_pembinaan` — the URL param and
 * also the natural key every other table's FK points at (ajis_anak, ajis_pemasangan,
 * sdm_penugasan all `.references(() => ajisWilayahPembinaan.idWilayahPembinaan)`
 * per db/schema/anak.ts, db/schema/pemasangan.ts, db/schema/sdm.ts) — unlike
 * ajis_kantor's oid/id split, this table's PK doubles as the FK target.
 *
 * Role scoping (§2.1a) matches app/api/anakjuara/pg/wilayah/route.ts: group 1
 * sees everything, group 2 is scoped to their own kantor_id, other groups
 * (Korwil) are scoped to their own id_wilayah_pembinaan.
 *
 * PUT/POST-level writes are gated to group 1/2 (lib/auth.ts isGroup12) — a
 * scoped group-2 admin may only edit a wilayah under their own kantor. DELETE
 * is Super Admin only (group 1), and refuses (409 IN_USE) when any
 * ajis_anak / ajis_pemasangan / sdm_penugasan row still references this
 * wilayah, since there is no DB-level ON DELETE CASCADE to rely on.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession, isGroup12, type SessionData } from '@/lib/auth';
import { buildWritable, isUniqueViolation, rowToWilayahPg, WILAYAH_DETAIL_COLUMNS } from '@/lib/wilayahPg/fields';
import type { AjisWilayahPgInput } from '@/types/wilayah-pg';

type ScopeRow = { kantor_id: string | null; id_wilayah_pembinaan: number };

/** True when the session's role scope covers this row (§2.1a role scoping). */
function inScope(session: SessionData, row: ScopeRow): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return row.kantor_id === session.idKantor;
  return String(row.id_wilayah_pembinaan) === String(session.idWilayahPembinaan);
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

class KantorNotFoundError extends Error {
  constructor() {
    super('Kantor tidak ditemukan.');
    this.name = 'KantorNotFoundError';
  }
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
    const idWilayah = parseId(id);
    if (idWilayah === null) {
      return NextResponse.json({ error: 'ID wilayah tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${WILAYAH_DETAIL_COLUMNS} FROM ajis_wilayah_pembinaan w WHERE w.id_wilayah_pembinaan = $1 LIMIT 1`,
      [idWilayah],
    );
    if (!row) {
      return NextResponse.json({ error: 'Wilayah tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, { kantor_id: row.kantor_id as string | null, id_wilayah_pembinaan: row.id_wilayah_pembinaan as number })) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ data: rowToWilayahPg(row) });
  } catch (err) {
    console.error('[pg wilayah detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data wilayah.' }, { status: 500 });
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
    if (!isGroup12(session)) {
      return NextResponse.json(
        { error: 'Hanya Super Admin atau Admin Cabang yang dapat mengubah data wilayah.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const idWilayah = parseId(id);
    if (idWilayah === null) {
      return NextResponse.json({ error: 'ID wilayah tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<ScopeRow>(
      'SELECT kantor_id, id_wilayah_pembinaan FROM ajis_wilayah_pembinaan WHERE id_wilayah_pembinaan = $1',
      [idWilayah],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Wilayah tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = (await req.json()) as AjisWilayahPgInput;
    if (Object.prototype.hasOwnProperty.call(body, 'namaWilayah') && !body.namaWilayah?.trim()) {
      return NextResponse.json({ error: 'nama_wilayah tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }

    // Re-denormalize nama_kantor when kantor_id changes, mirroring the POST
    // handler in ../route.ts.
    let patch: AjisWilayahPgInput = { ...body };
    if (Object.prototype.hasOwnProperty.call(body, 'kantorId')) {
      const kantorId = body.kantorId?.trim() || null;
      if (kantorId) {
        const kantor = await queryOne<{ kantor: string | null }>(
          'SELECT kantor FROM ajis_kantor WHERE oid = $1',
          [kantorId],
        );
        if (!kantor) throw new KantorNotFoundError();
        patch = { ...patch, kantorId, namaKantor: kantor.kantor };
      } else {
        patch = { ...patch, kantorId: null, namaKantor: null };
      }
    }

    const { columns, placeholders, values } = buildWritable(patch, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');

    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ajis_wilayah_pembinaan SET ${setClause} WHERE id_wilayah_pembinaan = $1 RETURNING *`,
      [idWilayah, ...values],
    );

    return NextResponse.json({ data: rowToWilayahPg(rows[0]) });
  } catch (err) {
    if (err instanceof KantorNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'KANTOR_NOT_FOUND' }, { status: 404 });
    }
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: 'Nama wilayah sudah digunakan.', code: 'DUPLICATE_NAMA_WILAYAH' },
        { status: 409 },
      );
    }
    console.error('[pg wilayah update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data wilayah.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menghapus data wilayah.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const idWilayah = parseId(id);
    if (idWilayah === null) {
      return NextResponse.json({ error: 'ID wilayah tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<{ id_wilayah_pembinaan: number }>(
      'SELECT id_wilayah_pembinaan FROM ajis_wilayah_pembinaan WHERE id_wilayah_pembinaan = $1',
      [idWilayah],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Wilayah tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const usedByAnak = await queryOne<{ id: number }>(
      'SELECT id FROM ajis_anak WHERE id_wilayah_pembinaan = $1 LIMIT 1',
      [idWilayah],
    );
    const usedByPemasangan = usedByAnak
      ? null
      : await queryOne<{ id: number }>(
          'SELECT id FROM ajis_pemasangan WHERE id_wilayah_pembinaan = $1 LIMIT 1',
          [idWilayah],
        );
    const usedByPenugasan = usedByAnak || usedByPemasangan
      ? null
      : await queryOne<{ id: number }>(
          'SELECT id FROM sdm_penugasan WHERE id_wilayah_pembinaan = $1 LIMIT 1',
          [idWilayah],
        );
    if (usedByAnak || usedByPemasangan || usedByPenugasan) {
      return NextResponse.json({ error: 'Wilayah masih digunakan', code: 'IN_USE' }, { status: 409 });
    }

    const affected = await execute('DELETE FROM ajis_wilayah_pembinaan WHERE id_wilayah_pembinaan = $1', [idWilayah]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Wilayah tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { idWilayahPembinaan: idWilayah } });
  } catch (err) {
    console.error('[pg wilayah delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data wilayah.' }, { status: 500 });
  }
}
