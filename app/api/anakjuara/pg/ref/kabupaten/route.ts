/**
 * GET  /api/anakjuara/pg/ref/kabupaten — Data Kabupaten list (Postgres,
 *      ref_kabupaten, joined to ref_propinsi for nama_propinsi).
 * POST /api/anakjuara/pg/ref/kabupaten — create a new kabupaten; `kabid` is
 *      server-generated from the chosen `propid` (lib/refPg/generateCodes.ts).
 *
 * Session required for GET, no row-scoping. POST/PUT/DELETE gated to Super
 * Admin only (session.idGroupUser === 1) — CLAUDE.md task brief.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { generateKabid, GeneratedCodeTooLongError } from '@/lib/refPg/generateCodes';
import { buildKabupatenWritable, isUniqueViolation, rowToKabupatenPg } from '@/lib/refPg/fields';
import type { RefKabupatenPgInput, RefKabupatenPgListItem } from '@/types/ref-pg';

const LIST_COLUMNS = `
  k.id, k.kabid, k.propid, k.kabupaten, k.kota, k.ibukota, k.aktif,
  p.propinsi AS nama_propinsi`;

type ListRow = {
  id: number; kabid: string; propid: string; kabupaten: string; kota: boolean;
  ibukota: string | null; aktif: boolean; nama_propinsi: string | null;
};

function toListItem(r: ListRow): RefKabupatenPgListItem {
  return {
    id: r.id, kabid: r.kabid, propid: r.propid, namaPropinsi: r.nama_propinsi,
    kabupaten: r.kabupaten, kota: r.kota, ibukota: r.ibukota, aktif: r.aktif,
  };
}

class PropinsiNotFoundError extends Error {
  constructor() {
    super('Propinsi tidak ditemukan.');
    this.name = 'PropinsiNotFoundError';
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const q = sp.get('q')?.trim() || '';
    const propid = sp.get('propid')?.trim() || '';
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

    if (q) push('k.kabupaten ILIKE ?', `%${q}%`);
    if (propid) push('k.propid = ?', propid);
    if (aktifParam === 'true' || aktifParam === 'false') push('k.aktif = ?', aktifParam === 'true');

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ref_kabupaten k ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ref_kabupaten k
       LEFT JOIN ref_propinsi p ON p.propid = k.propid
       ${WHERE}
       ORDER BY k.kabupaten ASC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows.map(toListItem),
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    });
  } catch (err) {
    console.error('[pg ref kabupaten list]', err);
    return NextResponse.json({ error: 'Gagal memuat data kabupaten.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menambah data kabupaten.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as RefKabupatenPgInput;
    const propid = body.propid?.trim();
    const kabupaten = body.kabupaten?.trim();
    if (!propid) {
      return NextResponse.json({ error: 'Propinsi wajib dipilih.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!kabupaten) {
      return NextResponse.json({ error: 'Nama kabupaten wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    if (propid.length + 2 > 4) {
      return NextResponse.json({ error: 'propid terlalu panjang untuk menghasilkan kabid.', code: 'PROPID_TOO_LONG' }, { status: 400 });
    }

    const propinsi = await queryOne<{ propid: string }>('SELECT propid FROM ref_propinsi WHERE propid = $1', [propid]);
    if (!propinsi) throw new PropinsiNotFoundError();

    const kabid = await generateKabid(propid);

    const { columns, placeholders, values } = buildKabupatenWritable({ ...body, propid, kabupaten }, 2);

    const rows = await executeReturning<Record<string, unknown>>(
      `INSERT INTO ref_kabupaten (kabid, ${columns.join(', ')})
       VALUES ($1, ${placeholders.join(', ')})
       RETURNING *`,
      [kabid, ...values],
    );

    const propinsiRow = await queryOne<{ propinsi: string }>('SELECT propinsi FROM ref_propinsi WHERE propid = $1', [propid]);

    return NextResponse.json({
      data: rowToKabupatenPg({ ...rows[0], nama_propinsi: propinsiRow?.propinsi ?? null }),
    }, { status: 201 });
  } catch (err) {
    if (err instanceof PropinsiNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'PROPINSI_NOT_FOUND' }, { status: 404 });
    }
    if (err instanceof GeneratedCodeTooLongError) {
      return NextResponse.json({ error: err.message, code: 'PROPID_TOO_LONG' }, { status: 400 });
    }
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Kabid sudah digunakan.', code: 'DUPLICATE_KABID' }, { status: 409 });
    }
    console.error('[pg ref kabupaten create]', err);
    return NextResponse.json({ error: 'Gagal membuat data kabupaten.' }, { status: 500 });
  }
}
