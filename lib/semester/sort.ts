/**
 * Parse ajis_semester into a calendar key. Do not sort by id / raw tgl_awal:
 * those columns hold timezone-shifted datetimes and placeholder years (2125).
 */
export interface SemesterSortInput {
  semesterid: string;
  semester:   string;
  tgl_awal?:  string | null;
  tgl_akhir?: string | null;
  tahun?:     string | null;
  jenis?:     string | null;
  onprogress?: string | null;
  is_current?: boolean | number;
}

const MIN_YEAR = 2010;

function calendarYear(): number {
  return new Date().getFullYear();
}

/** True for Juli–Desember / genap. */
export function isGenapSemester(row: SemesterSortInput): boolean {
  const jenis = String(row.jenis || '').toLowerCase();
  if (jenis === 'genap') return true;
  if (jenis === 'ganjil') return false;
  const name = String(row.semester || '').toLowerCase();
  if (name.includes('juli') || name.includes('desember') || name.includes('jul')) return true;
  if (name.includes('januari') || name.includes('juni')) return false;
  const start = parseDate(row.tgl_awal);
  return start ? start.getUTCMonth() >= 6 : false;
}

function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Year from `tahun`, then the name ("Juli - Desember 2026"), then tgl_awal. */
export function semesterYear(row: SemesterSortInput): number {
  const fromCol = Number(String(row.tahun || '').replace(/\D/g, '').slice(0, 4));
  if (fromCol >= MIN_YEAR && fromCol <= calendarYear() + 1) return fromCol;

  const named = String(row.semester || '').match(/\b(20\d{2}|19\d{2})\b/g);
  if (named) {
    const y = Number(named[named.length - 1]);
    if (y >= MIN_YEAR && y <= calendarYear() + 1) return y;
  }

  const start = parseDate(row.tgl_awal);
  if (start) {
    const y = start.getUTCFullYear();
    if (y >= MIN_YEAR && y <= calendarYear() + 1) return y;
  }
  return 0;
}

/** Higher = later. Year * 2 + 1 for Jul–Dec, + 0 for Jan–Jun. */
export function semesterSortKey(row: SemesterSortInput): number {
  const y = semesterYear(row);
  if (!y) return 0;
  return y * 2 + (isGenapSemester(row) ? 1 : 0);
}

export function isCurrentSemester(row: SemesterSortInput, now?: Date): boolean {
  if (row.onprogress === 'y' || row.is_current === true || row.is_current === 1) return true;
  const start = parseDate(row.tgl_awal);
  const end = parseDate(row.tgl_akhir);
  if (!start || !end) return false;
  const t = (now instanceof Date ? now : new Date()).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function isPlausibleSemester(row: SemesterSortInput): boolean {
  const y = semesterYear(row);
  return y >= MIN_YEAR && y <= calendarYear() + 1;
}

/** Current first, then older half-years only (no future / placeholder years). */
export function sortSemesters<T extends SemesterSortInput>(rows: T[]): T[] {
  const plausible = rows.filter(isPlausibleSemester);
  const current = plausible.find(row => isCurrentSemester(row));
  const maxKey = current
    ? semesterSortKey(current)
    : plausible.reduce((m, r) => Math.max(m, semesterSortKey(r)), 0);

  return plausible
    .filter(r => semesterSortKey(r) <= maxKey)
    .sort((a, b) => {
      const ac = isCurrentSemester(a) ? 1 : 0;
      const bc = isCurrentSemester(b) ? 1 : 0;
      if (ac !== bc) return bc - ac;
      return semesterSortKey(b) - semesterSortKey(a);
    });
}
