/**
 * lib/semester/queries.ts — full CRUD over `ajis_semester`.
 * Ported from `modules/ajis/class/SemesterClass.php` (legacy `CImportTarget`).
 *
 * The existing GET /api/anakjuara/semester (search-select combo, `SemesterOption`)
 * is untouched — these helpers back the new admin page instead.
 *
 * Schema notes (DDL-confirmed, `ajis_semester` is MyISAM, `id` is AUTO_INCREMENT
 * but legacy code inserts an explicit max+1 id rather than relying on it — kept
 * here for parity since this table never moves to Postgres):
 *  - `onprogress` is `enum('n','y')`, not a tinyint.
 *  - 13 template-image columns hold Blob URLs, one per PDF section
 *    (see `SEMESTER_TEMPLATE_FIELDS` in types/semester.ts).
 *  - Legacy `ImportTarget_Onprogress` only set the target row's flag, never
 *    unsetting the others — that let more than one semester end up "active".
 *    Here, activating one clears all others first inside a transaction, so
 *    `fetchActiveSemester()` (and the Generate Lapsem action that depends on
 *    it) always resolves exactly one row.
 */
import { query, queryOne, execute, withTransaction, txExecute, txQueryOne } from '@/lib/db';
import { SEMESTER_TEMPLATE_FIELDS } from '@/types/semester';
import type { Semester, SemesterInput, SemesterTemplateField } from '@/types/semester';

const ALL_COLUMNS = `id, semesterid, semester, tgl_awal, tgl_akhir, onprogress,
  ${SEMESTER_TEMPLATE_FIELDS.join(', ')}`;

export async function fetchSemesterList(params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<{ rows: Semester[]; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const args: unknown[] = [];
  if (params.q) {
    conditions.push('(semester LIKE ? OR semesterid LIKE ?)');
    const like = `%${params.q}%`;
    args.push(like, like);
  }
  const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [{ total }] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ajis_semester ${WHERE}`,
    args,
  );

  const rows = await query<Semester>(
    `SELECT ${ALL_COLUMNS}
     FROM ajis_semester
     ${WHERE}
     ORDER BY onprogress DESC, YEAR(tgl_awal) ASC
     LIMIT ? OFFSET ?`,
    [...args, limit, offset],
  );

  return { rows, total };
}

export async function fetchSemesterById(id: number): Promise<Semester | null> {
  return queryOne<Semester>(
    `SELECT ${ALL_COLUMNS} FROM ajis_semester WHERE id = ?`,
    [id],
  );
}

/** Active semester (onprogress = 'y'). Used by the "Generate Lapsem" action. */
export async function fetchActiveSemester(): Promise<Semester | null> {
  return queryOne<Semester>(
    `SELECT ${ALL_COLUMNS} FROM ajis_semester WHERE onprogress = 'y' LIMIT 1`,
  );
}

export async function createSemester(input: SemesterInput): Promise<number> {
  return withTransaction(async (conn) => {
    const last = await txQueryOne<{ id: number }>(
      conn,
      `SELECT id FROM ajis_semester ORDER BY id DESC LIMIT 1`,
    );
    const nextId = (last?.id ?? 0) + 1;

    if (input.onprogress === 'y') {
      await txExecute(conn, `UPDATE ajis_semester SET onprogress = 'n' WHERE onprogress = 'y'`);
    }

    await txExecute(
      conn,
      `INSERT INTO ajis_semester (id, semesterid, semester, tgl_awal, tgl_akhir, onprogress, lapsem)
       VALUES (?, ?, ?, ?, ?, ?, 'y')`,
      [nextId, input.semesterid, input.semester, input.tgl_awal, input.tgl_akhir, input.onprogress ?? 'n'],
    );
    return nextId;
  });
}

export async function updateSemester(id: number, input: SemesterInput): Promise<void> {
  await withTransaction(async (conn) => {
    if (input.onprogress === 'y') {
      await txExecute(conn, `UPDATE ajis_semester SET onprogress = 'n' WHERE onprogress = 'y' AND id != ?`, [id]);
    }
    await txExecute(
      conn,
      `UPDATE ajis_semester
       SET semesterid = ?, semester = ?, tgl_awal = ?, tgl_akhir = ?, onprogress = ?
       WHERE id = ?`,
      [input.semesterid, input.semester, input.tgl_awal, input.tgl_akhir, input.onprogress ?? 'n', id],
    );
  });
}

export async function setOnprogress(id: number, onprogress: 'y' | 'n'): Promise<void> {
  if (onprogress === 'y') {
    await execute(`UPDATE ajis_semester SET onprogress = 'n' WHERE onprogress = 'y'`);
  }
  await execute(`UPDATE ajis_semester SET onprogress = ? WHERE id = ?`, [onprogress, id]);
}

export async function deleteSemester(id: number): Promise<void> {
  await execute(`DELETE FROM ajis_semester WHERE id = ?`, [id]);
}

/**
 * Upload target for one of the 13 template-image fields. Legacy stamped
 * `{id_employee}_{filename}` with a hardcoded `id_employee = "1"` (flagged in
 * research as a placeholder bug, not ported) — here the column is simply set
 * to the uploaded Blob URL.
 */
export async function updateSemesterTemplateField(
  id: number,
  field: SemesterTemplateField,
  url: string,
): Promise<void> {
  if (!SEMESTER_TEMPLATE_FIELDS.includes(field)) {
    throw new Error(`Field template tidak dikenal: ${field}`);
  }
  // `field` is validated against the fixed SEMESTER_TEMPLATE_FIELDS allowlist above,
  // so interpolating the column name here does not admit user-controlled SQL.
  await execute(`UPDATE ajis_semester SET ${field} = ? WHERE id = ?`, [url, id]);
}
