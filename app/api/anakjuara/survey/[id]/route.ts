/**
 * GET/PUT/DELETE /api/anakjuara/survey/{id} — single Data Survey record (MySQL).
 * Keyed by the numeric `id_survey` (AUTO_INCREMENT; the table's PK is the
 * composite (id_survey, id_anak), but id_survey alone is unique in practice).
 *
 * PUT only ever writes the survey-specific fields (SURVEY_UPDATABLE_FIELDS) —
 * the bio fields denormalized from ajis_anak at create time are not
 * re-derived. A 'Layak' result applies the same promotion as POST.
 *
 * DELETE is a plain hard delete of the survey row only — it deliberately does
 * NOT revert ajis_anak.status_survey / status_anak_juara, mirroring
 * app/api/anakjuara/pg/survey/[id]/route.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, withTransaction, txQueryOne, txExecute, txExecuteResult } from '@/lib/db';
import { getSession, type SessionData } from '@/lib/auth';
import { buildUpdatable, SURVEY_DETAIL_COLUMNS } from '@/lib/survey/fields';
import type { AjisSurveyInput } from '@/types/survey';

type ScopeRow = { kantor_id: string | null; id_wilayah_pembinaan: string | null };

function inScope(session: SessionData, row: ScopeRow): boolean {
  if (session.idGroupUser === 1) return true;
  if (session.idGroupUser === 2) return row.kantor_id === session.idKantor;
  return String(row.id_wilayah_pembinaan ?? '') === String(session.idWilayahPembinaan);
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idSurvey = parseId(id);
    if (idSurvey === null) {
      return NextResponse.json({ error: 'ID survey tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const row = await queryOne<Record<string, unknown>>(
      `SELECT ${SURVEY_DETAIL_COLUMNS} FROM ajis_survey WHERE id_survey = ? LIMIT 1`,
      [idSurvey],
    );
    if (!row) {
      return NextResponse.json({ error: 'Survey tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, { kantor_id: row.kantor_id as string | null, id_wilayah_pembinaan: row.id_wilayah_pembinaan as string | null })) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ data: row });
  } catch (err) {
    console.error('[survey detail]', err);
    return NextResponse.json({ error: 'Gagal memuat data survey.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idSurvey = parseId(id);
    if (idSurvey === null) {
      return NextResponse.json({ error: 'ID survey tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const body = (await req.json()) as AjisSurveyInput;

    const result = await withTransaction(async conn => {
      const existing = await txQueryOne<ScopeRow & { id_anak: string }>(
        conn,
        'SELECT id_anak, kantor_id, id_wilayah_pembinaan FROM ajis_survey WHERE id_survey = ?',
        [idSurvey],
      );
      if (!existing) return null;
      if (!inScope(session, existing)) return 'FORBIDDEN' as const;

      const { columns, placeholders, values } = buildUpdatable(body);
      if (columns.length === 0) return 'NO_CHANGES' as const;

      const setClause = [
        ...columns.map((col, i) => `${col} = ${placeholders[i]}`),
        'user_update = ?',
        'date_update = NOW()',
      ].join(', ');

      await txExecuteResult(
        conn,
        `UPDATE ajis_survey SET ${setClause} WHERE id_survey = ?`,
        [...values, session.username, idSurvey],
      );

      if (body.hasil_kesimpulan_survey === 'Layak') {
        await txExecute(
          conn,
          `UPDATE ajis_anak SET status_survey = 'y', status_anak_juara = 'caj' WHERE id_anak = ?`,
          [existing.id_anak],
        );
      }

      return await txQueryOne<Record<string, unknown>>(
        conn,
        `SELECT ${SURVEY_DETAIL_COLUMNS} FROM ajis_survey WHERE id_survey = ? LIMIT 1`,
        [idSurvey],
      );
    });

    if (result === null) {
      return NextResponse.json({ error: 'Survey tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (result === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }
    if (result === 'NO_CHANGES') {
      return NextResponse.json({ error: 'Tidak ada perubahan.', code: 'VALIDATION' }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error('[survey update]', err);
    return NextResponse.json({ error: 'Gagal mengubah data survey.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idSurvey = parseId(id);
    if (idSurvey === null) {
      return NextResponse.json({ error: 'ID survey tidak valid.', code: 'VALIDATION' }, { status: 400 });
    }

    const existing = await queryOne<ScopeRow>(
      'SELECT kantor_id, id_wilayah_pembinaan FROM ajis_survey WHERE id_survey = ?',
      [idSurvey],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Survey tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const result = await execute('DELETE FROM ajis_survey WHERE id_survey = ?', [idSurvey]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Survey tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id_survey: idSurvey } });
  } catch (err) {
    console.error('[survey delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data survey.' }, { status: 500 });
  }
}
