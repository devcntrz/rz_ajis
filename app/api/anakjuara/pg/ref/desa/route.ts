/**
 * GET  /api/anakjuara/pg/ref/desa — Data Desa/Kelurahan list (Postgres,
 *      ref_desa, joined to ref_kecamatan for nama_kecamatan).
 * POST /api/anakjuara/pg/ref/desa — create a new desa/kelurahan; `desaid`
 *      is server-generated from the chosen `camatid` + `kelurahan` flag
 *      (legacy GenerateDesaID). `propid`/`kabid` are denormalized from the
 *      resolved kecamatan → kabupaten chain.
 *
 * Session required for GET, no row-scoping. POST/PUT/DELETE gated to Super
 * Admin only (session.idGroupUser === 1).
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, executeReturning } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { generateDesaid, GeneratedCodeTooLongError } from '@/lib/refPg/generateCodes';
import { buildDesaWritable, isUniqueViolation, rowToDesaPg } from '@/lib/refPg/fields';
import type { RefDesaPgInput, RefDesaPgListItem } from '@/types/ref-pg';

const LIST_COLUMNS = `
  d.id, d.desaid, d.nama_desa, d.kelurahan, d.camatid, d.propid, d.kabid,
  d.nomor_induk_desa, d.aktif, c.nama_kecamatan AS nama_kecamatan`;

type ListRow = {
  id: number; desaid: string; nama_desa: string; kelurahan: boolean; camatid: string;
  propid: string | null; kabid: string | null; nomor_induk_desa: string | null;
  aktif: boolean; nama_kecamatan: string | null;
};

function toListItem(r: ListRow): RefDesaPgListItem {
  return {
    id: r.id, desaid: r.desaid, namaDesa: r.nama_desa, kelurahan: r.kelurahan, camatid: r.camatid,
    namaKecamatan: r.nama_kecamatan, propid: r.propid, kabid: r.kabid,
    nomorIndukDesa: r.nomor_induk_desa, aktif: r.aktif,
  };
}

class KecamatanNotFoundError extends Error {
  constructor() {
    super('Kecamatan tidak ditemukan.');
    this.name = 'KecamatanNotFoundError';
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
    const camatid = sp.get('camatid')?.trim() || '';
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

    if (q) push('d.nama_desa ILIKE ?', `%${q}%`);
    if (camatid) push('d.camatid = ?', camatid);
    if (aktifParam === 'true' || aktifParam === 'false') push('d.aktif = ?', aktifParam === 'true');

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ref_desa d ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ref_desa d
       LEFT JOIN ref_kecamatan c ON c.camatid = d.camatid
       ${WHERE}
       ORDER BY d.nama_desa ASC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows.map(toListItem),
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    });
  } catch (err) {
    console.error('[pg ref desa list]', err);
    return NextResponse.json({ error: 'Gagal memuat data desa.' }, { status: 500 });
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
        { error: 'Hanya Super Admin yang dapat menambah data desa.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as RefDesaPgInput;
    const camatid = body.camatid?.trim();
    const namaDesa = body.namaDesa?.trim();
    const kelurahan = body.kelurahan ?? false;
    if (!camatid) {
      return NextResponse.json({ error: 'Kecamatan wajib dipilih.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!namaDesa) {
      return NextResponse.json({ error: 'Nama desa/kelurahan wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    const kecamatan = await queryOne<{ camatid: string; kabid: string; nama_kecamatan: string }>(
      'SELECT camatid, kabid, nama_kecamatan FROM ref_kecamatan WHERE camatid = $1',
      [camatid],
    );
    if (!kecamatan) throw new KecamatanNotFoundError();

    const kabupaten = await queryOne<{ kabid: string; propid: string }>(
      'SELECT kabid, propid FROM ref_kabupaten WHERE kabid = $1',
      [kecamatan.kabid],
    );

    const desaid = await generateDesaid(camatid, kelurahan);

    const { columns, placeholders, values } = buildDesaWritable(
      { ...body, camatid, namaDesa, kelurahan, propid: kabupaten?.propid ?? null, kabid: kecamatan.kabid },
      2,
    );

    const rows = await executeReturning<Record<string, unknown>>(
      `INSERT INTO ref_desa (desaid, ${columns.join(', ')})
       VALUES ($1, ${placeholders.join(', ')})
       RETURNING *`,
      [desaid, ...values],
    );

    return NextResponse.json({
      data: rowToDesaPg({ ...rows[0], nama_kecamatan: kecamatan.nama_kecamatan }),
    }, { status: 201 });
  } catch (err) {
    if (err instanceof KecamatanNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'KECAMATAN_NOT_FOUND' }, { status: 404 });
    }
    if (err instanceof GeneratedCodeTooLongError) {
      return NextResponse.json({ error: err.message, code: 'CAMATID_TOO_LONG' }, { status: 400 });
    }
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'Desaid sudah digunakan.', code: 'DUPLICATE_DESAID' }, { status: 409 });
    }
    console.error('[pg ref desa create]', err);
    return NextResponse.json({ error: 'Gagal membuat data desa.' }, { status: 500 });
  }
}
