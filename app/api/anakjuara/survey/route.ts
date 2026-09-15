/**
 * GET  /api/anakjuara/survey — Data Survey list (MySQL, ajis_survey).
 * POST /api/anakjuara/survey — create a new home-survey record for a child.
 *
 * MySQL transisi track (CLAUDE.md §2.1) — lib/db.ts, '?' placeholders.
 *
 * Create is transactional (withTransaction): it looks up the child in
 * ajis_anak (role-scope-checked), denormalizes bio fields onto the new
 * ajis_survey row, and — when the survey concludes 'Layak' — promotes the
 * child (status_survey='y', status_anak_juara='caj') in the same transaction,
 * mirroring app/api/anakjuara/pg/survey/route.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, withTransaction, txQueryOne, txExecute, txExecuteResult } from '@/lib/db';
import { getSession, getScopeCondition, type SessionData } from '@/lib/auth';
import { buildWritable, SURVEY_DETAIL_COLUMNS } from '@/lib/survey/fields';
import type { AjisSurveyInput, AjisSurveyListItem } from '@/types/survey';

const LIST_COLUMNS = `
  s.id_survey, s.tgl_survey, s.petugas_survey, s.id_anak,
  s.nama_lengkap, s.jns_kel, s.jenjang_pendidikan,
  s.kantor_id, s.nama_kantor, s.id_wilayah_pembinaan, s.nama_wilayah,
  s.asnaf, s.hasil_kesimpulan_survey, s.asnaf_anak, s.date_insert`;

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

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 's');
    const conditions: string[] = [scope];
    const params: unknown[] = [...scopeParams];

    if (q) {
      conditions.push('(s.nama_lengkap LIKE ? OR s.id_anak LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (hasilKesimpulan) { conditions.push('s.hasil_kesimpulan_survey = ?'); params.push(hasilKesimpulan); }
    if (wilayah) { conditions.push('s.id_wilayah_pembinaan = ?'); params.push(wilayah); }

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_survey s ${WHERE}`,
      params,
    );

    const rows = await query<AjisSurveyListItem>(
      `SELECT ${LIST_COLUMNS}
       FROM ajis_survey s
       ${WHERE}
       ORDER BY s.date_insert DESC, s.id_survey DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return NextResponse.json({ data: rows, total: countRow?.total ?? 0, page, limit });
  } catch (err) {
    console.error('[survey list]', err);
    return NextResponse.json({ error: 'Gagal memuat data survey.' }, { status: 500 });
  }
}

type AnakScopeRow = {
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
  jns_kel: string | null;
  jenjang_pendidikan: string | null;
  tgl_pengajuan: string | null;
  status_anak_juara: string | null;
};

function inScope(session: SessionData, row: { kantor_id: string | null; id_wilayah_pembinaan: number | null }): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return String(row.kantor_id ?? '') === String(session.idKantor);
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
}

class AnakNotFoundError extends Error {
  constructor() { super('Anak tidak ditemukan.'); this.name = 'AnakNotFoundError'; }
}
class AnakOutOfScopeError extends Error {
  constructor() { super('Anda tidak memiliki akses ke data anak ini.'); this.name = 'AnakOutOfScopeError'; }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as AjisSurveyInput;
    const idAnak = body.id_anak?.trim();
    if (!idAnak) {
      return NextResponse.json({ error: 'id_anak wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    const result = await withTransaction(async conn => {
      const anak = await txQueryOne<AnakScopeRow>(
        conn,
        `SELECT id_anak, kantor_id, id_wilayah_pembinaan,
                nama_lengkap, nama_lengkap_ayah, nama_lengkap_ibu, nama_lengkap_wali,
                nama_kantor, nama_wilayah, asnaf, alamat,
                jns_kel, jenjang_pendidikan, tgl_pengajuan, status_anak_juara
         FROM ajis_anak WHERE id_anak = ?`,
        [idAnak],
      );
      if (!anak) throw new AnakNotFoundError();
      if (!inScope(session, anak)) throw new AnakOutOfScopeError();

      const denormalized: AjisSurveyInput = {
        ...body,
        nama_lengkap: anak.nama_lengkap,
        nama_lengkap_ayah: anak.nama_lengkap_ayah,
        nama_lengkap_ibu: anak.nama_lengkap_ibu,
        nama_lengkap_wali: anak.nama_lengkap_wali,
        kantor_id: anak.kantor_id,
        nama_kantor: anak.nama_kantor,
        id_wilayah_pembinaan: anak.id_wilayah_pembinaan != null ? String(anak.id_wilayah_pembinaan) : null,
        nama_wilayah: anak.nama_wilayah,
        asnaf: anak.asnaf,
        alamat: anak.alamat,
        jns_kel: anak.jns_kel,
        jenjang_pendidikan: anak.jenjang_pendidikan,
        tgl_pengajuan: anak.tgl_pengajuan,
        status_anak: anak.status_anak_juara,
        // ajis_anak carries no propinsi/kabupaten/kecamatan/desa columns — these
        // come from the form itself; NOT NULL in ajis_survey so default to ''.
        nama_propinsi: body.nama_propinsi ?? '',
        nama_kabupaten: body.nama_kabupaten ?? '',
        nama_kecamatan: body.nama_kecamatan ?? '',
        nama_desa: body.nama_desa ?? '',
        // NOT NULL without a default in ajis_survey — fill a safe default when blank.
        asnaf_anak: body.asnaf_anak ?? 'dhuafa',
        biaya_pendidikan_spp_perbulan: body.biaya_pendidikan_spp_perbulan ?? 0,
        bantuan_rutin_dari_lembaga_lain: body.bantuan_rutin_dari_lembaga_lain ?? 'tidak',
      };

      const { columns, placeholders, values } = buildWritable(denormalized);
      const insertColumns = ['id_anak', ...columns, 'user_insert', 'date_insert'];
      const insertPlaceholders = ['?', ...placeholders, '?', 'NOW()'];

      const inserted = await txExecuteResult(
        conn,
        `INSERT INTO ajis_survey (${insertColumns.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`,
        [idAnak, ...values, session.username],
      );

      if (denormalized.hasil_kesimpulan_survey === 'Layak') {
        await txExecute(
          conn,
          `UPDATE ajis_anak SET status_survey = 'y', status_anak_juara = 'caj' WHERE id_anak = ?`,
          [idAnak],
        );
      }

      const idSurvey = inserted.insertId;
      return await txQueryOne<Record<string, unknown>>(
        conn,
        `SELECT ${SURVEY_DETAIL_COLUMNS} FROM ajis_survey WHERE id_survey = ? LIMIT 1`,
        [idSurvey],
      );
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    if (err instanceof AnakNotFoundError) {
      return NextResponse.json({ error: err.message, code: 'ANAK_NOT_FOUND' }, { status: 404 });
    }
    if (err instanceof AnakOutOfScopeError) {
      return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('[survey create]', err);
    return NextResponse.json({ error: 'Gagal membuat data survey.' }, { status: 500 });
  }
}
