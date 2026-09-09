/**
 * GET  /api/anakjuara/pg/user — Manajemen User list (Postgres, ajis_user).
 * POST /api/anakjuara/pg/user — create a new user.
 *
 * Postgres primary track (PRD §5.1) — lib/pg.ts, $n placeholders. Role scoping is
 * written inline here rather than via lib/auth's getScopeCondition, which only
 * targets the MySQL '?' placeholder style — same approach as
 * app/api/anakjuara/pg/anak/route.ts.
 *
 * No password field: `ajis_user` carries no password column on the Postgres
 * track (§3.3 / §2.1a) — login stays the legacy MySQL scheme. Nothing here
 * writes one.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { buildWritable, isUniqueViolation, rowToUserPg } from '@/lib/userPg/fields';
import type { AjisUserPgInput, AjisUserPgListItem } from '@/types/user-pg';

const LIST_COLUMNS = `
  u.id_user, u.username, u.email, u.nik,
  u.kantor_id, u.nama_kantor, u.id_wilayah_pembinaan, u.nama_wilayah,
  u.id_group_user, g.group_user, u.aktif, u.date_insert`;

type ListRow = {
  id_user: number; username: string; email: string | null; nik: string | null;
  kantor_id: string | null; nama_kantor: string | null;
  id_wilayah_pembinaan: number | null; nama_wilayah: string | null;
  id_group_user: number | null; group_user: string | null;
  aktif: boolean; date_insert: string | null;
};

function toListItem(r: ListRow): AjisUserPgListItem {
  return {
    idUser: r.id_user,
    username: r.username,
    email: r.email,
    nik: r.nik,
    kantorId: r.kantor_id,
    namaKantor: r.nama_kantor,
    idWilayahPembinaan: r.id_wilayah_pembinaan,
    namaWilayah: r.nama_wilayah,
    idGroupUser: r.id_group_user,
    groupUser: r.group_user,
    aktif: r.aktif,
    dateInsert: r.date_insert,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const idGroupUser = sp.get('id_group_user') || '';
    const aktif = sp.get('aktif') || '';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10) || 50));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const push = (sql: string, ...vals: unknown[]) => {
      const ph = vals.map(() => `$${idx++}`);
      conditions.push(ph.reduce((acc, p) => acc.replace('?', p), sql));
      params.push(...vals);
    };

    // Role scoping (lib/auth.ts SessionData): group 1 = no filter,
    // group 2 = branch admin (kantor), others = korwil (wilayah).
    if (session.idGroupUser === 2) {
      push('u.kantor_id = ?', session.idKantor);
    } else if (session.idGroupUser !== 1) {
      push('u.id_wilayah_pembinaan = ?::bigint', session.idWilayahPembinaan);
    }

    if (q) {
      push('(u.username ILIKE ? OR u.nama_kantor ILIKE ? OR u.nama_wilayah ILIKE ?)', `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (idGroupUser) push('u.id_group_user = ?::bigint', idGroupUser);
    if (aktif) push('u.aktif = ?::boolean', aktif === 'true' || aktif === '1');

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ajis_user u ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ajis_user u
       LEFT JOIN ajis_group_user g ON g.id_group_user = u.id_group_user
       ${WHERE}
       ORDER BY u.username ASC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows.map(toListItem),
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    });
  } catch (err) {
    console.error('[pg user list]', err);
    return NextResponse.json({ error: 'Gagal memuat data user.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as AjisUserPgInput;
    const username = body.username?.trim();
    if (!username) {
      return NextResponse.json({ error: 'Username wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    // Scope the new record to the creator's own branch/wilayah when they aren't
    // super admin, mirroring the anak-pg feature's create-time scoping.
    const scoped: AjisUserPgInput = { ...body, username };
    if (session.idGroupUser === 2) {
      scoped.kantorId = session.idKantor;
    } else if (session.idGroupUser !== 1 && !scoped.idWilayahPembinaan) {
      scoped.idWilayahPembinaan = Number(session.idWilayahPembinaan);
    }

    const { columns, placeholders, values } = buildWritable(scoped, 1);
    const insertColumns = [...columns, 'user_insert', 'date_insert'];
    const insertPlaceholders = [...placeholders, `$${values.length + 1}`, `$${values.length + 2}`];
    const insertValues = [...values, session.username, new Date()];

    const rows = await executeReturning<Record<string, unknown>>(
      `INSERT INTO ajis_user (${insertColumns.join(', ')})
       VALUES (${insertPlaceholders.join(', ')})
       RETURNING id_user, ${columns.join(', ')}, user_insert, date_insert`,
      insertValues,
    );

    return NextResponse.json({ data: rowToUserPg(rows[0]) }, { status: 201 });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: 'Username sudah digunakan.', code: 'DUPLICATE_USERNAME' },
        { status: 409 },
      );
    }
    console.error('[pg user create]', err);
    return NextResponse.json({ error: 'Gagal membuat data user.' }, { status: 500 });
  }
}
