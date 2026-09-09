/**
 * GET  /api/anakjuara/pg/anak — Pengajuan Beasiswa list (Postgres, ajis_anak).
 * POST /api/anakjuara/pg/anak — create a new anak record.
 *
 * Postgres primary track (PRD §5.1) — lib/pg.ts, $n placeholders. Role scoping is
 * written inline here rather than via lib/auth's getScopeCondition, which only
 * targets the MySQL '?' placeholder style.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, withTransaction, txQueryOne, txExecuteReturning, type TxConnection } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { ANAK_WRITABLE_FIELDS, buildWritable, rowToAnakPg } from '@/lib/anakPg/fields';
import type { AnakPgInput, AnakPgListItem } from '@/types/anak-pg';

const LIST_COLUMNS = `
  a.id_anak, a.nama_lengkap, a.nama_panggilan, a.jns_kel,
  a.jenjang_pendidikan, a.kelas, a.nama_sekolah,
  a.asnaf, a.status_ortu, a.status_anak_juara,
  a.id_wilayah_pembinaan, a.nama_wilayah, a.kantor_id, a.nama_kantor,
  a.tgl_lahir, a.tgl_terdaftar, a.foto, a.telp_yang_bisa_dihubungi, a.aktif`;

type ListRow = {
  id_anak: string; nama_lengkap: string; nama_panggilan: string | null; jns_kel: 'l' | 'p' | null;
  jenjang_pendidikan: string | null; kelas: string | null; nama_sekolah: string | null;
  asnaf: string | null; status_ortu: string | null; status_anak_juara: string | null;
  id_wilayah_pembinaan: number | null; nama_wilayah: string | null;
  kantor_id: string | null; nama_kantor: string | null;
  tgl_lahir: string | null; tgl_terdaftar: string | null; foto: string | null;
  telp_yang_bisa_dihubungi: string | null; aktif: boolean;
};

function toListItem(r: ListRow): AnakPgListItem {
  return {
    idAnak: r.id_anak,
    namaLengkap: r.nama_lengkap,
    namaPanggilan: r.nama_panggilan,
    jnsKel: r.jns_kel,
    jenjangPendidikan: r.jenjang_pendidikan,
    kelas: r.kelas,
    namaSekolah: r.nama_sekolah,
    asnaf: r.asnaf,
    statusOrtu: r.status_ortu,
    statusAnakJuara: r.status_anak_juara,
    idWilayahPembinaan: r.id_wilayah_pembinaan,
    namaWilayah: r.nama_wilayah,
    kantorId: r.kantor_id,
    namaKantor: r.nama_kantor,
    tglLahir: r.tgl_lahir,
    tglTerdaftar: r.tgl_terdaftar,
    foto: r.foto,
    telpYangBisaDihubungi: r.telp_yang_bisa_dihubungi,
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
    const jenjang = sp.get('jenjang_pendidikan') || '';
    const asnaf = sp.get('asnaf') || '';
    const statusAnakJuara = sp.get('status_anak_juara') || '';
    const wilayah = sp.get('id_wilayah_pembinaan') || '';
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
      push('a.kantor_id = ?', session.idKantor);
    } else if (session.idGroupUser !== 1) {
      push('a.id_wilayah_pembinaan = ?::bigint', session.idWilayahPembinaan);
    }

    if (q) {
      push('(a.nama_lengkap ILIKE ? OR a.id_anak ILIKE ?)', `%${q}%`, `%${q}%`);
    }
    if (jenjang) push('a.jenjang_pendidikan = ?', jenjang);
    if (asnaf) push('a.asnaf = ?', asnaf);
    if (statusAnakJuara) push('a.status_anak_juara = ?', statusAnakJuara);
    if (wilayah) push('a.id_wilayah_pembinaan = ?::bigint', wilayah);

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ajis_anak a ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ajis_anak a
       ${WHERE}
       ORDER BY a.nama_lengkap ASC
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
    console.error('[pg anak list]', err);
    return NextResponse.json({ error: 'Gagal memuat data pengajuan beasiswa.' }, { status: 500 });
  }
}

/**
 * Ports the legacy `AjisClassDeni::GenerateID_anak()` algorithm (PHP,
 * modules/ajis/class/AjisClassDeni.php) to Postgres. Format:
 *   {kantor oid with '-' removed}{2-digit current year}{4-digit zero-padded seq}
 * where the sequence is MAX(RIGHT(id_anak,4))+1 scoped to that kantor-code+year
 * prefix. Must run inside the same transaction as the INSERT — see caller.
 *
 * Deliberate simplification: this is a read-then-insert, not a locked
 * read-then-insert (the legacy PHP had the same race window). `id_anak` is a
 * NOT NULL UNIQUE natural key, not the surrogate PK, so a rare concurrent
 * collision surfaces as a clean 23505 unique-violation (409 below) rather than
 * data corruption — an acceptable, legacy-equivalent trade-off over the added
 * complexity of advisory locks for a low-traffic admin form.
 */
async function generateIdAnak(conn: TxConnection, kantorId: string): Promise<string> {
  const nokantor = kantorId.split('-').join('');
  const yy = new Date().getFullYear().toString().slice(-2);
  const prefix = `${nokantor}${yy}`;

  const row = await txQueryOne<{ last_seq: string | null }>(
    conn,
    `SELECT MAX(RIGHT(id_anak, 4)) AS last_seq FROM ajis_anak WHERE id_anak LIKE $1`,
    [`${prefix}%`],
  );
  const newSeq = (parseInt(row?.last_seq ?? '0', 10) || 0) + 1;
  const padded = String(newSeq).padStart(4, '0');
  return `${prefix}${padded}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // idAnak is never accepted from the client — it's server-generated below
    // (see generateIdAnak). Destructure it out so a client-sent value (if any)
    // is silently ignored rather than trusted.
    const { idAnak: _clientIdAnak, ...rest } = (await req.json()) as AnakPgInput & { idAnak?: string };
    void _clientIdAnak;
    const body = rest as AnakPgInput;
    const namaLengkap = body.namaLengkap?.trim();

    if (!namaLengkap) {
      return NextResponse.json({ error: 'nama_lengkap wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    // Scope the new record to the creator's own branch/wilayah when they aren't
    // super admin, so a branch/korwil user cannot silently create a record outside
    // the data they are allowed to see afterwards.
    const scoped: AnakPgInput = { ...body, namaLengkap };
    if (session.idGroupUser === 2) {
      scoped.kantorId = session.idKantor;
    } else if (session.idGroupUser !== 1 && !scoped.idWilayahPembinaan) {
      scoped.idWilayahPembinaan = Number(session.idWilayahPembinaan);
    }

    const kantorId = scoped.kantorId?.trim();
    if (!kantorId) {
      return NextResponse.json(
        { error: 'Kantor wajib dipilih sebelum menyimpan', code: 'KANTOR_REQUIRED' },
        { status: 400 },
      );
    }

    const { columns, placeholders, values } = buildWritable(scoped, 2);
    void ANAK_WRITABLE_FIELDS;

    try {
      const data = await withTransaction(async (conn) => {
        const idAnak = await generateIdAnak(conn, kantorId);
        const rows = await txExecuteReturning<Record<string, unknown>>(
          conn,
          `INSERT INTO ajis_anak (id_anak, ${columns.join(', ')})
           VALUES ($1, ${placeholders.join(', ')})
           RETURNING *`,
          [idAnak, ...values],
        );
        return rowToAnakPg(rows[0]);
      });
      return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
      // Postgres unique_violation (23505) — the generated id_anak collided with
      // a concurrent insert under the race window noted above.
      if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === '23505') {
        return NextResponse.json(
          { error: 'ID Anak yang dihasilkan bentrok, silakan coba lagi.', code: 'DUPLICATE' },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error('[pg anak create]', err);
    return NextResponse.json({ error: 'Gagal membuat data pengajuan beasiswa.' }, { status: 500 });
  }
}
