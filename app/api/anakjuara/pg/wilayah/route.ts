/**
 * GET  /api/anakjuara/pg/wilayah — Data Wilayah list (Postgres,
 *      ajis_wilayah_pembinaan, coaching-region master data).
 * POST /api/anakjuara/pg/wilayah — create a new wilayah pembinaan.
 *
 * Postgres primary track (CLAUDE.md §5.1) — lib/pg.ts, $n placeholders. Role
 * scoping is written inline here rather than via lib/auth's getScopeCondition,
 * which only targets the MySQL '?' placeholder style — same approach as
 * app/api/anakjuara/pg/survey/route.ts.
 *
 * Role scoping (§2.1a): group 1 (Super Admin) sees everything; group 2 (Branch
 * Admin) is filtered to their own kantor_id; every other group (Korwil, etc.)
 * is filtered to their own single id_wilayah_pembinaan.
 *
 * Only group 1/2 may create a wilayah (lib/auth.ts requireGroup12) — creating a
 * region is a branch/admin-level action, mirroring how the other admin-gated
 * writes in this codebase use isGroup12/requireGroup12.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, executeReturning } from '@/lib/pg';
import { getSession, isGroup12 } from '@/lib/auth';
import { buildWritable, isUniqueViolation, rowToWilayahPg } from '@/lib/wilayahPg/fields';
import type { AjisWilayahPgInput, AjisWilayahPgListItem } from '@/types/wilayah-pg';

const LIST_COLUMNS = `
  w.id_wilayah_pembinaan, w.nama_wilayah, w.alamat_wilayah,
  w.kantor_id, w.nama_kantor, w.status_approve,
  w.nama_propinsi, w.nama_kabupaten, w.nama_kecamatan, w.nama_desa, w.aktif`;

type ListRow = {
  id_wilayah_pembinaan: number; nama_wilayah: string; alamat_wilayah: string | null;
  kantor_id: string | null; nama_kantor: string | null; status_approve: string | null;
  nama_propinsi: string | null; nama_kabupaten: string | null;
  nama_kecamatan: string | null; nama_desa: string | null; aktif: boolean;
};

function toListItem(r: ListRow): AjisWilayahPgListItem {
  return {
    idWilayahPembinaan: r.id_wilayah_pembinaan,
    namaWilayah: r.nama_wilayah,
    alamatWilayah: r.alamat_wilayah,
    kantorId: r.kantor_id,
    namaKantor: r.nama_kantor,
    statusApprove: r.status_approve,
    namaPropinsi: r.nama_propinsi,
    namaKabupaten: r.nama_kabupaten,
    namaKecamatan: r.nama_kecamatan,
    namaDesa: r.nama_desa,
    aktif: r.aktif,
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
    const kantorId = sp.get('kantor_id') || '';
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

    // Role scoping (lib/auth.ts SessionData): group 1 = no filter,
    // group 2 = branch admin (kantor), others = korwil (own wilayah only).
    if (session.idGroupUser === 2) {
      push('w.kantor_id = ?', session.idKantor);
    } else if (session.idGroupUser !== 1) {
      push('w.id_wilayah_pembinaan = ?', session.idWilayahPembinaan);
    }

    if (q) {
      push('(w.nama_wilayah ILIKE ? OR w.nama_kantor ILIKE ?)', `%${q}%`, `%${q}%`);
    }
    if (kantorId) push('w.kantor_id = ?', kantorId);
    if (aktifParam === 'true' || aktifParam === 'false') {
      push('w.aktif = ?', aktifParam === 'true');
    }

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ajis_wilayah_pembinaan w ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ajis_wilayah_pembinaan w
       ${WHERE}
       ORDER BY w.nama_wilayah ASC
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
    console.error('[pg wilayah list]', err);
    return NextResponse.json({ error: 'Gagal memuat data wilayah.' }, { status: 500 });
  }
}

/** Typed error the outer catch turns into a clean 404, mirroring
 *  app/api/anakjuara/pg/survey/route.ts's AnakNotFoundError. */
class KantorNotFoundError extends Error {
  constructor() {
    super('Kantor tidak ditemukan.');
    this.name = 'KantorNotFoundError';
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isGroup12(session)) {
      return NextResponse.json(
        { error: 'Hanya Super Admin atau Admin Cabang yang dapat menambah data wilayah.', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as AjisWilayahPgInput;
    const namaWilayah = body.namaWilayah?.trim();
    if (!namaWilayah) {
      return NextResponse.json({ error: 'nama_wilayah wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    // Denormalize nama_kantor from the chosen kantor_id, mirroring how
    // app/api/anakjuara/pg/survey/route.ts denormalizes bio fields from a
    // parent lookup inside its POST handler.
    let namaKantor = body.namaKantor ?? null;
    const kantorId = body.kantorId?.trim() || null;
    if (kantorId) {
      const kantor = await queryOne<{ kantor: string | null }>(
        'SELECT kantor FROM ajis_kantor WHERE oid = $1',
        [kantorId],
      );
      if (!kantor) throw new KantorNotFoundError();
      namaKantor = kantor.kantor;
    }

    const { columns, placeholders, values } = buildWritable(
      { ...body, namaWilayah, kantorId, namaKantor },
      1,
    );

    const rows = await executeReturning<Record<string, unknown>>(
      `INSERT INTO ajis_wilayah_pembinaan (${columns.join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING *`,
      values,
    );

    return NextResponse.json({ data: rowToWilayahPg(rows[0]) }, { status: 201 });
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
    console.error('[pg wilayah create]', err);
    return NextResponse.json({ error: 'Gagal membuat data wilayah.' }, { status: 500 });
  }
}
