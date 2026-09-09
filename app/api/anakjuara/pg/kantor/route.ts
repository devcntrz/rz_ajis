/**
 * GET  /api/anakjuara/pg/kantor — Master Kantor list (Postgres, ajis_kantor).
 * POST /api/anakjuara/pg/kantor — create a new kantor (branch office).
 *
 * Postgres primary track (CLAUDE.md §5.1) — lib/pg.ts, $n placeholders.
 *
 * Unlike ajis_anak / ajis_user, `ajis_kantor` is a small global master table with
 * no wilayah/kantor scoping of its own — a kantor row IS the scoping unit, not
 * something scoped by it. Every authenticated session may therefore read the
 * full list (so wilayah/user forms can pick from it), but only Super Admin
 * (id_group_user === 1) may write, since this is shared master data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, withTransaction, txQueryOne, txExecuteReturning, type TxConnection } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { buildWritable, isUniqueViolation, rowToKantorPg } from '@/lib/kantorPg/fields';
import type { AjisKantorPgCreateInput, AjisKantorPgListItem } from '@/types/kantor-pg';

/** Max width of ajis_kantor.oid (varchar(10)) — see the generation scheme below. */
const OID_MAX_LEN = 10;

/**
 * Server-side `oid` generation for `ajis_kantor` (POST create only).
 *
 * RECONSTRUCTED / ASSUMED SCHEME — not a literal port of legacy behavior.
 * The legacy PHP app inserted `oid` as `''` and relied on undiscoverable DB-side
 * behavior (AUTO_INCREMENT or a trigger) with no application-level generation
 * logic to recover. The only surviving clue is `ajis_anak.id_anak` generation,
 * which does `explode("-", $id_kantor)` and concatenates the two parts — implying
 * legacy `oid` values were a two-segment hyphenated code (e.g. "12-345").
 *
 * This implementation reconstructs a reasonable, consistent, hierarchical scheme
 * that fits that shape:
 *   - Top-level office (no oidParent): oid = "{2-digit seq}" among existing rows
 *     where oid_parent IS NULL, e.g. "01", "02", ...
 *   - Child office (oidParent given): oid = "{oidParent}-{2-digit seq}" among
 *     existing direct children of that parent (oid_parent = oidParent), e.g.
 *     parent "01" -> "01-01", "01-02", ...
 *
 * Runs inside the caller's transaction (SELECT MAX + INSERT) to narrow the
 * collision window; it does not eliminate it, the same small race the legacy
 * app effectively had. A collision surfaces as a 409 DUPLICATE_OID from the
 * `oid` unique constraint rather than corrupting data.
 */
async function generateOid(
  conn: TxConnection,
  oidParent: string | null,
): Promise<string> {
  if (oidParent === null) {
    const row = await txQueryOne<{ max_oid: string | null }>(
      conn,
      `SELECT MAX(oid) AS max_oid FROM ajis_kantor WHERE oid_parent IS NULL AND oid ~ '^[0-9]{2}$'`,
    );
    const next = row?.max_oid ? parseInt(row.max_oid, 10) + 1 : 1;
    return String(next).padStart(2, '0');
  }

  const row = await txQueryOne<{ max_seq: string | null }>(
    conn,
    `SELECT MAX(SUBSTRING(oid FROM '[0-9]+$')) AS max_seq
     FROM ajis_kantor
     WHERE oid_parent = $1 AND oid ~ '^.+-[0-9]{2}$'`,
    [oidParent],
  );
  const next = row?.max_seq ? parseInt(row.max_seq, 10) + 1 : 1;
  return `${oidParent}-${String(next).padStart(2, '0')}`;
}

const LIST_COLUMNS = `
  k.id, k.oid, k.kantor, k.alamat, k.no_telp, k.oid_parent, k.oid_parent_second, k.jenis`;

type ListRow = {
  id: number; oid: string; kantor: string | null; alamat: string | null;
  no_telp: string | null; oid_parent: string | null; oid_parent_second: string | null;
  jenis: string | null;
};

function toListItem(r: ListRow): AjisKantorPgListItem {
  return {
    id: r.id,
    oid: r.oid,
    kantor: r.kantor,
    alamat: r.alamat,
    noTelp: r.no_telp,
    oidParent: r.oid_parent,
    oidParentSecond: r.oid_parent_second,
    jenis: r.jenis,
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
    const oidParent = sp.get('oid_parent') || '';
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

    if (q) {
      push('(k.kantor ILIKE ? OR k.oid ILIKE ? OR k.alamat ILIKE ?)', `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (oidParent) push('k.oid_parent = ?', oidParent);

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ajis_kantor k ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ajis_kantor k
       ${WHERE}
       ORDER BY k.kantor ASC
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
    console.error('[pg kantor list]', err);
    return NextResponse.json({ error: 'Gagal memuat data kantor.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.idGroupUser !== 1) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat menambah data kantor.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    // `oid` is server-generated (see generateOid above) — never accept it from
    // the client even if sent, so a stale/malicious body can't smuggle one in.
    const body = (await req.json()) as AjisKantorPgCreateInput & { oid?: unknown };
    const kantor = body.kantor?.trim();
    const oidParent = body.oidParent?.trim() || null;

    if (!kantor) {
      return NextResponse.json({ error: 'kantor wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    const result = await withTransaction(async (conn) => {
      if (oidParent !== null) {
        const parent = await txQueryOne<{ oid: string }>(
          conn,
          'SELECT oid FROM ajis_kantor WHERE oid = $1',
          [oidParent],
        );
        if (!parent) {
          return { error: 'PARENT_KANTOR_NOT_FOUND' as const };
        }
      }

      const oid = await generateOid(conn, oidParent);
      if (oid.length > OID_MAX_LEN) {
        return { error: 'OID_TOO_LONG' as const };
      }

      const { columns, placeholders, values } = buildWritable({ ...body, kantor, oidParent }, 2);

      const rows = await txExecuteReturning<Record<string, unknown>>(
        conn,
        `INSERT INTO ajis_kantor (oid, ${columns.join(', ')})
         VALUES ($1, ${placeholders.join(', ')})
         RETURNING *`,
        [oid, ...values],
      );
      return { row: rows[0] };
    });

    if ('error' in result) {
      if (result.error === 'PARENT_KANTOR_NOT_FOUND') {
        return NextResponse.json(
          { error: 'oidParent tidak ditemukan.', code: 'PARENT_KANTOR_NOT_FOUND' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'Kode kantor (oid) yang dihasilkan terlalu panjang.', code: 'OID_TOO_LONG' },
        { status: 400 },
      );
    }

    return NextResponse.json({ data: rowToKantorPg(result.row) }, { status: 201 });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: 'oid sudah digunakan.', code: 'DUPLICATE_OID' },
        { status: 409 },
      );
    }
    console.error('[pg kantor create]', err);
    return NextResponse.json({ error: 'Gagal membuat data kantor.' }, { status: 500 });
  }
}
