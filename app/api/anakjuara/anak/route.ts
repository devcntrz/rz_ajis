/**
 * GET /api/anakjuara/anak — List children (paginated, filtered)
 * Scoped to user's wilayah/kantor based on role.
 * source=anak (default): ajis_anak
 * source=pemasangan: ajis_pemasangan JOIN ajis_anak where status_pasangan='y'
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, withTransaction, txQueryOne, txExecute } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';
import { EDITABLE_FIELDS } from './[id]/route';
import type { TxConnection } from '@/lib/db';

/**
 * Legacy formula (ajis-rz-v1 modules/ajis/class/AjisClassEka.php,
 * GenerateID_anak()): {kantor code, dash-joined}{2-digit year}{4-digit
 * zero-padded sequence}, e.g. kantor "0920-1" + year 21 + seq 61 -> "09201210061".
 * The sequence resets per kantor+year, taken from the max existing suffix.
 */
async function generateIdAnak(conn: TxConnection, kantorId: string): Promise<string> {
  const nokantor = kantorId.split('-').join('');
  const year = String(new Date().getFullYear()).slice(-2);
  const prefix = `${nokantor}${year}`;

  const last = await txQueryOne<{ maxseq: string | null }>(
    conn,
    `SELECT MAX(RIGHT(id_anak, 4)) AS maxseq
     FROM ajis_anak
     WHERE id_anak LIKE ? AND CHAR_LENGTH(id_anak) = ?`,
    [`${prefix}%`, prefix.length + 4],
  );

  const next = (Number(last?.maxseq ?? 0) || 0) + 1;
  const seq = String(next).padStart(4, '0');
  return `${prefix}${seq}`;
}

const SELECT_COLUMNS = `
  a.id_anak, a.nama_lengkap, a.nama_panggilan, a.jns_kel,
  a.jenjang_pendidikan, a.kelas, a.nama_sekolah,
  a.asnaf, a.status_ortu, a.id_wilayah_pembinaan,
  a.nama_wilayah, a.nama_kantor,
  a.tgl_lahir, a.tgl_terdaftar, a.foto,
  a.telp_yang_bisa_dihubungi`;

type AnakListRow = {
  id_anak: string; nama_lengkap: string; nama_panggilan: string;
  jns_kel: string; jenjang_pendidikan: string; kelas: string;
  nama_sekolah: string; asnaf: string; status_ortu: string;
  id_wilayah_pembinaan: number; nama_wilayah: string; nama_kantor: string;
  tgl_lahir: string; tgl_terdaftar: string; foto: string;
  telp_yang_bisa_dihubungi: string;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const q          = sp.get('q')          || '';
    const status     = sp.get('status_ortu')|| '';
    const jenjang    = sp.get('jenjang')    || '';
    const asnaf      = sp.get('asnaf')      || '';
    const wilayah    = sp.get('wilayah')    || '';
    const idSdm      = sp.get('id_sdm')     || '';
    const source     = sp.get('source') === 'pemasangan' ? 'pemasangan' : 'anak';
    const page       = Math.max(1, parseInt(sp.get('page')  || '1'));
    const limit      = Math.min(500, parseInt(sp.get('limit') || '10'));
    const offset     = (page - 1) * limit;

    if (source === 'pemasangan') {
      const { sql: scope, params: scopeParams } = getScopeCondition(session, 'p');
      const pemConditions: string[] = [scope, `p.status_pasangan = 'y'`];
      const pemParams: unknown[] = [...scopeParams];

      const pemSubquery = `
        SELECT DISTINCT p.id_anak
        FROM ajis_pemasangan p
        WHERE ${pemConditions.join(' AND ')}`;

      const conditions: string[] = [`a.aktif = 'y'`];
      const qparams: unknown[] = [...pemParams];

      if (q) {
        conditions.push(`(a.nama_lengkap LIKE ? OR a.nama_panggilan LIKE ? OR a.id_anak LIKE ?)`);
        const like = `%${q}%`;
        qparams.push(like, like, like);
      }
      if (status) { conditions.push('a.status_ortu LIKE ?'); qparams.push(`%${status}%`); }
      if (jenjang) { conditions.push('a.jenjang_pendidikan = ?'); qparams.push(jenjang); }
      if (asnaf)   { conditions.push('a.asnaf = ?'); qparams.push(asnaf); }
      if (wilayah) { conditions.push('a.id_wilayah_pembinaan = ?'); qparams.push(wilayah); }
      if (idSdm)   { conditions.push('a.id_sdm = ?'); qparams.push(idSdm); }

      const WHERE = conditions.join(' AND ');

      const [countRow] = await query<{ total: number }>(
        `SELECT COUNT(*) AS total
         FROM ajis_anak a
         INNER JOIN (${pemSubquery}) pem ON pem.id_anak = a.id_anak
         WHERE ${WHERE}`,
        qparams,
      );

      const rows = await query<AnakListRow>(
        `SELECT ${SELECT_COLUMNS}
         FROM ajis_anak a
         INNER JOIN (${pemSubquery}) pem ON pem.id_anak = a.id_anak
         WHERE ${WHERE}
         ORDER BY a.nama_lengkap
         LIMIT ? OFFSET ?`,
        [...qparams, limit, offset],
      );

      return NextResponse.json({ data: rows, total: countRow?.total ?? 0, page, limit });
    }

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');
    const conditions: string[]  = [scope, `a.aktif = 'y'`];
    const qparams: unknown[]    = [...scopeParams];

    if (q) {
      conditions.push(`(a.nama_lengkap LIKE ? OR a.nama_panggilan LIKE ? OR a.id_anak LIKE ?)`);
      const like = `%${q}%`;
      qparams.push(like, like, like);
    }
    if (status) { conditions.push('a.status_ortu LIKE ?'); qparams.push(`%${status}%`); }
    if (jenjang) { conditions.push('a.jenjang_pendidikan = ?'); qparams.push(jenjang); }
    if (asnaf)   { conditions.push('a.asnaf = ?');   qparams.push(asnaf); }
    if (wilayah) { conditions.push('a.id_wilayah_pembinaan = ?'); qparams.push(wilayah); }
    if (idSdm)   { conditions.push('a.id_sdm = ?'); qparams.push(idSdm); }

    const WHERE = conditions.join(' AND ');

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_anak a WHERE ${WHERE}`,
      qparams,
    );

    const rows = await query<AnakListRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM   ajis_anak a
       WHERE  ${WHERE}
       ORDER  BY a.nama_lengkap
       LIMIT  ? OFFSET ?`,
      [...qparams, limit, offset],
    );

    return NextResponse.json({ data: rows, total: countRow?.total ?? 0, page, limit });
  } catch (err) {
    console.error('[anak list]', err);
    return NextResponse.json({ error: 'Gagal memuat data anak.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Data tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    if (!String(body.nama_lengkap ?? '').trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!['l', 'p'].includes(String(body.jns_kel))) {
      return NextResponse.json({ error: 'Jenis kelamin tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!String(body.tgl_lahir ?? '').trim()) {
      return NextResponse.json({ error: 'Tanggal lahir wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    if (!String(body.kantor_id ?? '').trim() || !body.id_wilayah_pembinaan) {
      return NextResponse.json({ error: 'Kantor dan wilayah binaan wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    if (session.idGroupUser === 2 && String(body.kantor_id) !== String(session.idKantor)) {
      return NextResponse.json({ error: 'Kantor di luar akses Anda.', code: 'FORBIDDEN' }, { status: 403 });
    }
    if (session.idGroupUser === 9 && String(body.id_wilayah_pembinaan) !== String(session.idWilayahPembinaan)) {
      return NextResponse.json({ error: 'Wilayah di luar akses Anda.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const wilayah = await queryOne<{ nama_wilayah: string; nama_kantor: string }>(
      `SELECT MIN(nama_wilayah) AS nama_wilayah, MIN(nama_kantor) AS nama_kantor
       FROM ajis_wilayah_pembinaan WHERE id_wilayah_pembinaan = ? LIMIT 1`,
      [body.id_wilayah_pembinaan],
    );

    const insertFields: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        insertFields[field] = body[field];
      }
    }
    insertFields.aktif = insertFields.aktif ?? 'y';
    insertFields.nama_wilayah = wilayah?.nama_wilayah ?? '';
    insertFields.nama_kantor = wilayah?.nama_kantor ?? '';
    // Tanggal Terdaftar / Tanggal Pengajuan are set to "now" server-side, not
    // user-entered — they record when this submission happened.
    insertFields.tgl_terdaftar = new Date().toISOString().slice(0, 10);
    insertFields.tgl_pengajuan = new Date().toISOString().slice(0, 10);

    const idAnak = await withTransaction(async conn => {
      const generatedId = await generateIdAnak(conn, String(body.kantor_id));
      const fields = ['id_anak', ...Object.keys(insertFields)];
      const placeholders = fields.map(() => '?').join(', ');
      const values = [generatedId, ...Object.keys(insertFields).map(f => insertFields[f])];

      await txExecute(
        conn,
        `INSERT INTO ajis_anak (${fields.join(', ')}) VALUES (${placeholders})`,
        values,
      );
      return generatedId;
    });

    const created = await queryOne<Record<string, unknown>>(
      'SELECT * FROM ajis_anak WHERE id_anak = ? LIMIT 1',
      [idAnak],
    );

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error('[anak create]', err);
    return NextResponse.json({ error: 'Gagal menambahkan data anak.', code: 'CREATE_FAILED' }, { status: 500 });
  }
}
