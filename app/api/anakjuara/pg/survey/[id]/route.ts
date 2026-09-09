/**
 * GET/PUT/DELETE /api/anakjuara/pg/survey/{id} — single Data Survey record.
 *
 * Keyed by the numeric surrogate `id_survey` (plain identity PK, no natural key
 * to protect here — unlike ajis_anak.id_anak).
 *
 * PUT only ever writes the survey-specific fields (lib/surveyPg/fields.ts's
 * SURVEY_UPDATABLE_FIELDS) — the bio fields denormalized from ajis_anak at
 * create time are not re-derived on update. If the update sets
 * hasil_kesimpulan_survey to 'Layak', the same promotion as POST is applied,
 * inside a transaction.
 *
 * DELETE is a plain hard delete of the survey row only — it deliberately does
 * NOT revert ajis_anak.status_survey / status_anak_juara for a child that was
 * promoted by an earlier 'Layak' survey. Reverting would be surprising if the
 * child has since been re-surveyed, re-promoted through another path, or is
 * already an active Anak Juara — simplification per the task spec.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, withTransaction, txQueryOne, txExecute, txExecuteReturning } from '@/lib/pg';
import { getSession, type SessionData } from '@/lib/auth';
import { buildUpdatable, rowToSurveyPg, SURVEY_DETAIL_COLUMNS } from '@/lib/surveyPg/fields';
import type { AjisSurveyPgInput } from '@/types/survey-pg';

type ScopeRow = { kantor_id: string | null; id_wilayah_pembinaan: string | null };

/** True when the session's role scope covers this row (§2.1a role scoping). */
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
      `SELECT ${SURVEY_DETAIL_COLUMNS} FROM ajis_survey s WHERE s.id_survey = $1 LIMIT 1`,
      [idSurvey],
    );
    if (!row) {
      return NextResponse.json({ error: 'Survey tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, { kantor_id: row.kantor_id as string | null, id_wilayah_pembinaan: row.id_wilayah_pembinaan as string | null })) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ data: rowToSurveyPg(row) });
  } catch (err) {
    console.error('[pg survey detail]', err);
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

    const body = (await req.json()) as AjisSurveyPgInput;

    const result = await withTransaction(async (conn) => {
      const existing = await txQueryOne<ScopeRow & { id_anak: string }>(
        conn,
        'SELECT id_anak, kantor_id, id_wilayah_pembinaan FROM ajis_survey WHERE id_survey = $1',
        [idSurvey],
      );
      if (!existing) return null;
      if (!inScope(session, existing)) return 'FORBIDDEN' as const;

      const { columns, placeholders, values } = buildUpdatable(body, 3);
      const setClause = [
        ...columns.map((col, i) => `${col} = ${placeholders[i]}`),
        'user_update = $2',
      ].join(', ');

      if (columns.length === 0) {
        return 'NO_CHANGES' as const;
      }

      const rows = await txExecuteReturning<Record<string, unknown>>(
        conn,
        `UPDATE ajis_survey SET ${setClause}, date_update = $${values.length + 3}
         WHERE id_survey = $1 RETURNING *`,
        [idSurvey, session.username, ...values, new Date()],
      );

      if (body.hasilKesimpulanSurvey === 'Layak') {
        await txExecute(
          conn,
          `UPDATE ajis_anak SET status_survey = true, status_anak_juara = 'caj' WHERE id_anak = $1`,
          [existing.id_anak],
        );
      }

      return rows[0];
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

    return NextResponse.json({ data: rowToSurveyPg(result) });
  } catch (err) {
    console.error('[pg survey update]', err);
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
      'SELECT kantor_id, id_wilayah_pembinaan FROM ajis_survey WHERE id_survey = $1',
      [idSurvey],
    );
    if (!existing) {
      return NextResponse.json({ error: 'Survey tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }
    if (!inScope(session, existing)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke data ini.', code: 'FORBIDDEN' }, { status: 403 });
    }

    // Plain delete — deliberately does not revert ajis_anak.status_survey /
    // status_anak_juara. See file header.
    const affected = await execute('DELETE FROM ajis_survey WHERE id_survey = $1', [idSurvey]);
    if (affected === 0) {
      return NextResponse.json({ error: 'Survey tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data: { id_survey: idSurvey } });
  } catch (err) {
    console.error('[pg survey delete]', err);
    return NextResponse.json({ error: 'Gagal menghapus data survey.' }, { status: 500 });
  }
}
