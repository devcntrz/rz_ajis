/**
 * GET /api/anakjuara/semester — Semester list (searchable).
 * Sort parses tahun / name year / jenis first (not id or raw tgl_awal),
 * drops placeholder years (e.g. 2125), then current → newest half-year.
 *
 * `?mode=admin` switches to the full admin listing (all columns incl. the 13
 * template image URLs, paginated) used by the new Semester admin page — kept
 * on this same route rather than a separate `semester/admin/route.ts` since
 * the two modes share nothing but the base query and callers already hit this
 * URL; the existing combo-search contract (`SemesterOption`, no `mode` param)
 * is completely unchanged for `mode` absent.
 *
 * POST creates a new semester (admin only, `requireGroup12`).
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12 } from '@/lib/auth';
import { SEARCH_SELECT_LIMIT } from '@/lib/searchSelect';
import { fetchSemesterList, createSemester } from '@/lib/semester/queries';
import { sortSemesters } from '@/lib/semester/sort';
import type { SemesterInput } from '@/types/semester';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.nextUrl.searchParams.get('mode') === 'admin') {
      const page = Number(req.nextUrl.searchParams.get('page') ?? 1);
      const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20);
      const q = req.nextUrl.searchParams.get('q') || undefined;
      const { rows, total } = await fetchSemesterList({ page, limit, q });
      return NextResponse.json({ data: rows, pagination: { page, limit, total } });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';
    const requested = parseInt(req.nextUrl.searchParams.get('limit') || String(SEARCH_SELECT_LIMIT), 10);
    const limit = Math.min(50, Math.max(1, Number.isFinite(requested) ? requested : SEARCH_SELECT_LIMIT));

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q) {
      conditions.push('(semester LIKE ? OR semesterid LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like);
    }

    const WHERE = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = await query<{
      semesterid: string;
      semester: string;
      tgl_awal: string;
      tgl_akhir: string;
      tahun: string | null;
      jenis: string | null;
      onprogress: string | null;
      is_current: number;
    }>(
      `SELECT semesterid, semester, tgl_awal, tgl_akhir, tahun, jenis, onprogress,
              CASE
                WHEN onprogress = 'y' THEN 1
                WHEN CURDATE() BETWEEN DATE(tgl_awal) AND DATE(tgl_akhir) THEN 1
                ELSE 0
              END AS is_current
       FROM ajis_semester
       ${WHERE}`,
      params,
    );

    const ordered = sortSemesters(rows.map(r => ({
      semesterid: r.semesterid,
      semester:   r.semester,
      tgl_awal:   r.tgl_awal,
      tgl_akhir:  r.tgl_akhir,
      tahun:      r.tahun,
      jenis:      r.jenis,
      onprogress: r.onprogress,
      is_current: r.is_current === 1,
    }))).slice(0, limit);

    return NextResponse.json({ data: ordered });
  } catch (err) {
    console.error('[semester list]', err);
    return NextResponse.json({ error: 'Gagal memuat semester.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Hanya Admin/SpMD Cabang yang dapat membuat semester.', code: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json() as Partial<SemesterInput>;
    if (!body.semesterid || !body.semester || !body.tgl_awal || !body.tgl_akhir) {
      return NextResponse.json(
        { error: 'semesterid, semester, tgl_awal, tgl_akhir wajib diisi.', code: 'VALIDATION' },
        { status: 400 },
      );
    }

    const id = await createSemester({
      semesterid: body.semesterid,
      semester:   body.semester,
      tgl_awal:   body.tgl_awal,
      tgl_akhir:  body.tgl_akhir,
      onprogress: body.onprogress === 'y' ? 'y' : 'n',
    });

    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (err) {
    console.error('[semester create]', err);
    return NextResponse.json({ error: 'Gagal membuat semester.' }, { status: 500 });
  }
}
