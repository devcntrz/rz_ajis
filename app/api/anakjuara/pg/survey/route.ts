/**
 * GET  /api/anakjuara/pg/survey — Data Survey list (Postgres, ajis_survey).
 * POST /api/anakjuara/pg/survey — create a new home-survey record for a child.
 *
 * Postgres primary track (PRD §5.1) — lib/pg.ts, $n placeholders. Role scoping is
 * written inline here rather than via lib/auth's getScopeCondition, which only
 * targets the MySQL '?' placeholder style — same approach as
 * app/api/anakjuara/pg/anak/route.ts and app/api/anakjuara/pg/user/route.ts.
 *
 * Create is transactional (CLAUDE.md §2.1 rule 7 / withTransaction): it looks up
 * the child in ajis_anak (role-scope-checked), denormalizes bio fields onto the
 * new ajis_survey row, and — when the survey concludes 'Layak' — promotes the
 * child (status_survey = true, status_anak_juara = 'caj') in the same
 * transaction, replicating the legacy auto-promotion flow.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, withTransaction, txQueryOne, txExecuteReturning, txExecute } from '@/lib/pg';
import { getSession, type SessionData } from '@/lib/auth';
import { buildWritable, rowToSurveyPg, SURVEY_WRITABLE_FIELDS } from '@/lib/surveyPg/fields';
import type { AjisSurveyPgInput, AjisSurveyPgListItem } from '@/types/survey-pg';

const LIST_COLUMNS = `
  s.id_survey, s.tgl_survey, s.petugas_survey, s.id_anak,
  s.nama_lengkap, s.jns_kel, s.jenjang_pendidikan,
  s.kantor_id, s.nama_kantor, s.id_wilayah_pembinaan, s.nama_wilayah,
  s.asnaf, s.hasil_kesimpulan_survey, s.asnaf_anak, s.date_insert`;

type ListRow = {
  id_survey: number; tgl_survey: string | null; petugas_survey: string | null; id_anak: string;
  nama_lengkap: string | null; jns_kel: string | null; jenjang_pendidikan: string | null;
  kantor_id: string | null; nama_kantor: string | null;
  id_wilayah_pembinaan: string | null; nama_wilayah: string | null;
  asnaf: string | null; hasil_kesimpulan_survey: string | null;
  asnaf_anak: 'yatim' | 'piatu' | 'dhuafa' | null; date_insert: string | null;
};

function toListItem(r: ListRow): AjisSurveyPgListItem {
  return {
    idSurvey: r.id_survey,
    tglSurvey: r.tgl_survey,
    petugasSurvey: r.petugas_survey,
    idAnak: r.id_anak,
    namaLengkap: r.nama_lengkap,
    jnsKel: r.jns_kel,
    jenjangPendidikan: r.jenjang_pendidikan,
    kantorId: r.kantor_id,
    namaKantor: r.nama_kantor,
    idWilayahPembinaan: r.id_wilayah_pembinaan,
    namaWilayah: r.nama_wilayah,
    asnaf: r.asnaf,
    hasilKesimpulanSurvey: r.hasil_kesimpulan_survey,
    asnafAnak: r.asnaf_anak,
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
    const hasilKesimpulan = sp.get('hasil_kesimpulan_survey') || '';
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
      push('s.kantor_id = ?', session.idKantor);
    } else if (session.idGroupUser !== 1) {
      push('s.id_wilayah_pembinaan = ?', session.idWilayahPembinaan);
    }

    if (q) {
      push('(s.nama_lengkap ILIKE ? OR s.id_anak ILIKE ?)', `%${q}%`, `%${q}%`);
    }
    if (hasilKesimpulan) push('s.hasil_kesimpulan_survey = ?', hasilKesimpulan);
    if (wilayah) push('s.id_wilayah_pembinaan = ?', wilayah);

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne<{ total: string }>(
      `SELECT COUNT(*) AS total FROM ajis_survey s ${WHERE}`,
      params,
    );

    const rows = await query<ListRow>(
      `SELECT ${LIST_COLUMNS}
       FROM ajis_survey s
       ${WHERE}
       ORDER BY s.date_insert DESC NULLS LAST, s.id_survey DESC
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
    console.error('[pg survey list]', err);
    return NextResponse.json({ error: 'Gagal memuat data survey.' }, { status: 500 });
  }
}

type AnakScopeRow = {
  id: number;
  id_anak: string;
  kantor_id: string | null;
  id_wilayah_pembinaan: number | null;
  nama_lengkap: string;
  nama_lengkap_ayah: string | null;
  nama_lengkap_ibu: string | null;
  nama_lengkap_wali: string | null;
  nama_kantor: string | null;
  nama_wilayah: string | null;
  asnaf: string | null;
  alamat: string | null;
  nama_propinsi: string | null;
  nama_kabupaten: string | null;
  nama_kecamatan: string | null;
  nama_desa: string | null;
  jns_kel: string | null;
  jenjang_pendidikan: string | null;
  tgl_pengajuan: string | null;
  status_anak_juara: string | null;
};

/** True when the session's role scope covers this anak row (§2.1a role scoping). */
function inScope(session: SessionData, row: { kantor_id: string | null; id_wilayah_pembinaan: number | null }): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return row.kantor_id === session.idKantor;
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
}

/** Typed error the outer catch turns into a clean 404, per the task spec. */
class AnakNotFoundError extends Error {
  constructor() {
    super('Anak tidak ditemukan.');
    this.name = 'AnakNotFoundError';
  }
}

class AnakOutOfScopeError extends Error {
  constructor() {
    super('Anda tidak memiliki akses ke data anak ini.');
    this.name = 'AnakOutOfScopeError';
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as AjisSurveyPgInput;
    const idAnak = body.idAnak?.trim();
    if (!idAnak) {
      return NextResponse.json({ error: 'id_anak wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    const result = await withTransaction(async (conn) => {
      const anak = await txQueryOne<AnakScopeRow>(
        conn,
        `SELECT id, id_anak, kantor_id, id_wilayah_pembinaan,
                nama_lengkap, nama_lengkap_ayah, nama_lengkap_ibu, nama_lengkap_wali,
                nama_kantor, nama_wilayah, asnaf, alamat,
                nama_propinsi, nama_kabupaten, nama_kecamatan, nama_desa,
                jns_kel, jenjang_pendidikan, tgl_pengajuan, status_anak_juara
         FROM ajis_anak WHERE id_anak = $1`,
        [idAnak],
      );
      if (!anak) throw new AnakNotFoundError();
      if (!inScope(session, anak)) throw new AnakOutOfScopeError();

      // Denormalize bio fields from ajis_anak, then layer the survey-specific
      // fields from the request body on top (CLAUDE.md §2.1 rule 7).
      const denormalized: AjisSurveyPgInput = {
        ...body,
        namaLengkap: anak.nama_lengkap,
        namaLengkapAyah: anak.nama_lengkap_ayah,
        namaLengkapIbu: anak.nama_lengkap_ibu,
        namaLengkapWali: anak.nama_lengkap_wali,
        kantorId: anak.kantor_id,
        namaKantor: anak.nama_kantor,
        idWilayahPembinaan: anak.id_wilayah_pembinaan != null ? String(anak.id_wilayah_pembinaan) : null,
        namaWilayah: anak.nama_wilayah,
        asnaf: anak.asnaf,
        alamat: anak.alamat,
        namaPropinsi: anak.nama_propinsi,
        namaKabupaten: anak.nama_kabupaten,
        namaKecamatan: anak.nama_kecamatan,
        namaDesa: anak.nama_desa,
        jnsKel: anak.jns_kel,
        jenjangPendidikan: anak.jenjang_pendidikan,
        tglPengajuan: anak.tgl_pengajuan,
        // ajis_anak carries no dedicated "status" column for this purpose;
        // status_anak_juara ('caj'/'aj'/...) is the closest semantic match and
        // is what the legacy survey flow denormalized here.
        statusAnak: anak.status_anak_juara,
      };

      // $1 = id_anak, $2.. = writable columns, then user_insert/date_insert.
      const { columns, placeholders, values } = buildWritable(denormalized, 2);
      void SURVEY_WRITABLE_FIELDS;
      const insertColumns = [...columns, 'user_insert', 'date_insert'];
      const insertPlaceholders = [...placeholders, `$${values.length + 2}`, `$${values.length + 3}`];

      const inserted = await txExecuteReturning<Record<string, unknown>>(
        conn,
        `INSERT INTO ajis_survey (id_anak, ${insertColumns.join(', ')})
         VALUES ($1, ${insertPlaceholders.join(', ')})
         RETURNING *`,
        [idAnak, ...values, session.username, new Date()],
      );

      // Legacy auto-promotion: a 'Layak' survey outcome promotes the child to
      // Calon Anak Juara.
      if (denormalized.hasilKesimpulanSurvey === 'Layak') {
        await txExecute(
          conn,
          `UPDATE ajis_anak SET status_survey = true, status_anak_juara = 'caj' WHERE id_anak = $1`,
          [idAnak],
        );
      }

      return inserted[0];
    });

    return NextResponse.json({ data: rowToSurveyPg(result) }, { status: 201 });
  } catch (err) {
    if (err instanceof AnakNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'ANAK_NOT_FOUND' }, { status: 404 });
    }
    if (err instanceof AnakOutOfScopeError) {
      return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('[pg survey create]', err);
    return NextResponse.json({ error: 'Gagal membuat data survey.' }, { status: 500 });
  }
}
