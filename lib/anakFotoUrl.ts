/**
 * `ajis_anak.foto` holds either a bare legacy filename (served from the old
 * asset host, see lib/pdf/cajPdfData.ts) or, once edited through this app, a
 * full Vercel Blob URL. This resolves either form to a displayable URL.
 */
const LEGACY_BASE = 'https://ajis.indonesiajuara.org';

export function anakFotoUrl(foto: string | null | undefined): string | null {
  if (!foto) return null;
  if (/^https?:\/\//i.test(foto)) return foto;
  return `${LEGACY_BASE}/upload/foto_ajis/${encodeURIComponent(foto)}`;
}
