/**
 * GET  /api/anakjuara/pg/ref/propinsi — Data Propinsi list (Postgres,
 *      ref_propinsi, root of the administrative reference hierarchy).
 * POST /api/anakjuara/pg/ref/propinsi — create a new propinsi.
 *
 * These are small, shared master tables (CLAUDE.md task brief): GET requires
 * a session but no row-level scoping; POST/PUT/DELETE are gated to Super
 * Admin only (session.idGroupUser === 1), mirroring how ajis_kantor writes
 * are superadmin-gated.
 *
 * `propid` is NOT server-generated — it is the root of the hierarchy and
 * corresponds to real-world provincial codes assigned externally, so it
 * stays a required manual text input on create; uniqueness is enforced by
 * the DB and turned into a friendly 409.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { buildPropinsiWritable, isUniqueViolation, rowToPropinsiPg } from '@/lib/refPg/fields';
import type { RefPropinsiPgInput, RefPropinsiPgListItem } from '@/types/ref-pg';

const LIST_COLUMNS = 'p.id, p.propid, p.propinsi, p.ibukota, p.aktif';

type ListRow = { id: number; propid: string; propinsi: string; ibukota: string | null; aktif: boolean };

function toListItem(r: ListRow): RefPropinsiPgListItem {
  return { id: r.id, propid: r.propid, propinsi: r.propinsi, ibukota: r.ibukota, aktif: r.aktif };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const aktifParam = sp.get('aktif');
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

    if (q) push('p.propinsi ILIKE ?', `%${q}%`);
    if (aktifParam === 'true' || aktifParam === 'false') push('p.aktif = ?', aktifParam === 'true');

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ref_propinsi p ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS} FROM ref_propinsi p ${WHERE} ORDER BY p.propinsi ASC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows.map(toListItem),
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    });
  } catch (err) {
    console.error('[pg ref propinsi list]', err);
    return NextResponse.json({ error: 'Gagal memuat data propinsi.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menambah data propinsi.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as RefPropinsiPgInput;
    const propid = body.propid?.trim();
    const propinsi = body.propinsi?.trim();
    if (!propid) {
      return NextResponse.json({ error: 'propid wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!propinsi) {
      return NextResponse.json({ error: 'Nama propinsi wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    if (propid.length > 4) {
      return NextResponse.json({ error: 'propid maksimal 4 karakter.', code: 'PROPID_TOO_LONG' }, { status: 400 });
    }

    const { columns, placeholders, values } = buildPropinsiWritable({ ...body, propid, propinsi }, 1);

    const rows = await executeReturning<Record<string, unknown>>(
      `INSERT INTO ref_propinsi (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values,
    );

    return NextResponse.json({ data: rowToPropinsiPg(rows[0]) }, { status: 201 });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Propid sudah digunakan.', code: 'DUPLICATE_PROPID' }, { status: 409 });
    }
    console.error('[pg ref propinsi create]', err);
    return NextResponse.json({ error: 'Gagal membuat data propinsi.' }, { status: 500 });
  }
}
