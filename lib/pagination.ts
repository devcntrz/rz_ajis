/** Default rows per page (desktop table & mobile infinite scroll). */
export const DEFAULT_PAGE_SIZE = 10;

export function parseRequestedPage(params: Record<string, string | number>): number {
  const n = parseInt(String(params.page ?? 1), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function isListPageReady(
  requestedPage: number,
  responsePage: number,
  isLoading: boolean,
  isValidating: boolean,
): boolean {
  if (isLoading && responsePage === 0) return false;
  return responsePage === requestedPage && !isValidating;
}

export function filtersAreEqual(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
