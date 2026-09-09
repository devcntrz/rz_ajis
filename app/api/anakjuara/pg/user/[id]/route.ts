/**
 * GET/PUT/DELETE /api/anakjuara/pg/user/{id} — single Manajemen User record.
 *
 * Keyed by the surrogate `id_user` — unlike ajis_anak, ajis_user has no separate
 * natural/business key (username is unique but is itself an editable field), so
 * the numeric PK is the right handle here.
 *
 * Delete is a hard delete gated to super admin (id_group_user === 1) — there is
 * no `aktif`-only soft-delete convention required here since the Toggle already
 * lets an admin deactivate a user without removing the row; DELETE is reserved
 * for actually removing a mistaken/duplicate account. Restricting it (and the
 * superadmin-role assignment on write) to group 1 mirrors requireGroup12's
 * admin-only gating style in lib/auth.ts, which only covers groups {1,2} — group 1
 * alone has no ready-made helper, so the check is written inline.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, executeReturning } from '@/lib/pg';
import { getSession, type SessionData } from '@/lib/auth';
import { USER_DETAIL_COLUMNS, buildWritable, isUniqueViolation, rowToUserPg } from '@/lib/userPg/fields';
import type { AjisUserPgInput } from '@/types/user-pg';

type ScopeRow = { kantor_id: string | null; id_wilayah_pembinaan: number | null };

/** True when the session's role scope covers this row (§2.1a role scoping). */
function inScope(session: SessionData, row: ScopeRow): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return row.kantor_id === session.idKantor;
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
}

/** Super admin only — gates DELETE and assigning id_group_user = 1 on write. */
function isSuperAdmin(session: SessionData): boolean {
  return session.idGroupUser === 1;
}

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
    const idUser = parseId(id);
    if (idUser === null) {
      return NextResponse.json({ error: 'ID user tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${USER_DETAIL_COLUMNS}
       FROM ajis_user u
       LEFT JOIN ajis_group_user g ON g.id_group_user = u.id_group_user
       WHERE u.id_user = $1 LIMIT 1`,
      [idUser],
    );
    if (!row) {
      return NextResponse.json({ error: 'User tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, { kantor_id: row.kantor_id as string | null, id_wilayah_pembinaan: row.id_wilayah_pembinaan as number | null })) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ data: rowToUserPg(row) });
  } catch (err) {
    console.error('[pg user detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data user.' }, { status: 500 });
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
    const idUser = parseId(id);
    if (idUser === null) {
      return NextResponse.json({ error: 'ID user tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<ScopeRow>(
      'SELECT kantor_id, id_wilayah_pembinaan FROM ajis_user WHERE id_user = $1',
      [idUser],
    );
    if (!existing) {
      return NextResponse.json({ error: 'User tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = (await req.json()) as AjisUserPgInput;
    if (Object.prototype.hasOwnProperty.call(body, 'username') && !body.username?.trim()) {
      return NextResponse.json({ error: 'Username tidak boleh kosong.', code: 'VALIDATION' }, { status: 400 });
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'idGroupUser')
      && body.idGroupUser === 1
      && !isSuperAdmin(session)
    ) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat menetapkan peran Super Admin.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const { columns, placeholders, values } = buildWritable(body, 2);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(', ');

    const rows = await executeReturning<Record<string, unknown>>(
      `UPDATE ajis_user SET ${setClause} WHERE id_user = $1
       RETURNING id_user, ${columns.join(', ')}, user_insert, date_insert`,
      [idUser, ...values],
    );

    return NextResponse.json({ data: rowToUserPg(rows[0]) });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: 'Username sudah digunakan.', code: 'DUPLICATE_USERNAME' },
        { status: 409 },
      );
    }
    console.error('[pg user update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data user.' }, { status: 500 });
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
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Hanya Super Admin yang dapat menghapus user.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const { id } = await params;
    const idUser = parseId(id);
    if (idUser === null) {
      return NextResponse.json({ error: 'ID user tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const affected = await execute('DELETE FROM ajis_user WHERE id_user = $1', [idUser]);
    if (affected === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id_user: idUser } });
  } catch (err) {
    console.error('[pg user delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data user.' }, { status: 500 });
  }
}
