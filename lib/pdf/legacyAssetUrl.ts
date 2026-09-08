/**
 * lib/pdf/legacyAssetUrl.ts — resolves a Lapsem template/photo DB value to a usable URL.
 *
 * `ajis_semester`/`manual_laporan` image columns hold either:
 *  - a bare legacy filename (e.g. `cover1.jpg`) for semesters never re-uploaded
 *    through the new `/semester` template-upload UI — these files still live on
 *    the legacy site, so we point straight at `ajis.indonesiajuara.org`; or
 *  - a full Vercel Blob URL, once an admin re-uploads via the new UI.
 * This resolver is a permanent dual-source shim, not a temporary migration step.
 */
const LEGACY_BASE = 'https://ajis.indonesiajuara.org';

export type LegacyAssetKind = 'template' | 'foto' | 'dokumentasi';

/** DB column name → legacy subfolder, for `template`/`foto` kinds. */
const SECTION_FOLDERS: Record<string, string> = {
  cover: 'cover',
  cover_siswa: 'cover_siswa',
  profil: 'profil',
  keuangan: 'keuangan',
  bawah: 'bawah',
  bawah_siswa: 'bawah_siswa',
  kotak_profil_ceria: 'kotak_profil_ceria',
  kotak_profil_siswa: 'kotak_profil_siswa',
  kotak_pembinaan_ceria: 'kotak_pembinaan_ceria',
  kotak_pembinaan_siswa: 'kotak_pembinaan_siswa',
  foto: 'foto_anak',
  foto_pembinaan: 'foto_pembinaan',
};

export function legacyAssetUrl(
  value: string | null | undefined,
  kind: LegacyAssetKind,
  section: string,
): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  if (kind === 'dokumentasi') {
    return `${LEGACY_BASE}/upload/dokumentasi_pembinaan/${value}`;
  }

  const folder = SECTION_FOLDERS[section] ?? section;
  const base = kind === 'template' ? 'lapsem' : 'lapsem_foto';
  return `${LEGACY_BASE}/modules/ajis/${base}/${folder}/${value}`;
}
