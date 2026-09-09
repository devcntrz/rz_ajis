/**
 * GET  /api/anakjuara/pg/ref/kecamatan — Data Kecamatan list (Postgres,
 *      ref_kecamatan, joined to ref_kabupaten for nama_kabupaten).
 * POST /api/anakjuara/pg/ref/kecamatan — create a new kecamatan; `camatid`
 *      is server-generated from the chosen `kabid` (legacy GenerateCamatID).
 *
 * Session required for GET, no row-scoping. POST/PUT/DELETE gated to Super
 * Admin only (session.idGroupUser === 1).
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { generateCamatid, GeneratedCodeTooLongError } from '@/lib/refPg/generateCodes';
import { buildKecamatanWritable, isUniqueViolation, rowToKecamatanPg } from '@/lib/refPg/fields';
import type { RefKecamatanPgInput, RefKecamatanPgListItem } from '@/types/ref-pg';

const LIST_COLUMNS = `
  c.id, c.camatid, c.nama_kecamatan, c.kodepos, c.kabid, c.aktif,
  k.kabupaten AS nama_kabupaten`;

type ListRow = {
  id: number; camatid: string; nama_kecamatan: string; kodepos: string | null;
  kabid: string; aktif: boolean; nama_kabupaten: string | null;
};

function toListItem(r: ListRow): RefKecamatanPgListItem {
  return {
    id: r.id, camatid: r.camatid, namaKecamatan: r.nama_kecamatan, kodepos: r.kodepos,
    kabid: r.kabid, namaKabupaten: r.nama_kabupaten, aktif: r.aktif,
  };
}

class KabupatenNotFoundError extends Error {
  constructor() {
    super('Kabupaten tidak ditemukan.');
    this.name = 'KabupatenNotFoundError';
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
    const kabid = sp.get('kabid')?.trim() || '';
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

    if (q) push('c.nama_kecamatan ILIKE ?', `%${q}%`);
    if (kabid) push('c.kabid = ?', kabid);
    if (aktifParam === 'true' || aktifParam === 'false') push('c.aktif = ?', aktifParam === 'true');

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ref_kecamatan c ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ref_kecamatan c
       LEFT JOIN ref_kabupaten k ON k.kabid = c.kabid
       ${WHERE}
       ORDER BY c.nama_kecamatan ASC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows.map(toListItem),
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    });
  } catch (err) {
    console.error('[pg ref kecamatan list]', err);
    return NextResponse.json({ error: 'Gagal memuat data kecamatan.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menambah data kecamatan.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as RefKecamatanPgInput;
    const kabid = body.kabid?.trim();
    const namaKecamatan = body.namaKecamatan?.trim();
    if (!kabid) {
      return NextResponse.json({ error: 'Kabupaten wajib dipilih.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!namaKecamatan) {
      return NextResponse.json({ error: 'Nama kecamatan wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    const kabupaten = await queryOne<{ kabid: string; kabupaten: string }>('SELECT kabid, kabupaten FROM ref_kabupaten WHERE kabid = $1', [kabid]);
    if (!kabupaten) throw new KabupatenNotFoundError();

    const camatid = await generateCamatid(kabid);

    const { columns, placeholders, values } = buildKecamatanWritable({ ...body, kabid, namaKecamatan }, 2);

    const rows = await executeReturning<Record<string, unknown>>(
      `INSERT INTO ref_kecamatan (camatid, ${columns.join(', ')})
       VALUES ($1, ${placeholders.join(', ')})
       RETURNING *`,
      [camatid, ...values],
    );

    return NextResponse.json({
      data: rowToKecamatanPg({ ...rows[0], nama_kabupaten: kabupaten.kabupaten }),
    }, { status: 201 });
  } catch (err) {
    if (err instanceof KabupatenNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'KABUPATEN_NOT_FOUND' }, { status: 404 });
    }
    if (err instanceof GeneratedCodeTooLongError) {
      return NextResponse.json({ error: err.message, code: 'KABID_TOO_LONG' }, { status: 400 });
    }
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Camatid sudah digunakan.', code: 'DUPLICATE_CAMATID' }, { status: 409 });
    }
    console.error('[pg ref kecamatan create]', err);
    return NextResponse.json({ error: 'Gagal membuat data kecamatan.' }, { status: 500 });
  }
}
