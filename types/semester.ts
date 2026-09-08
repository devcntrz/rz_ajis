export interface SemesterOption {
  semesterid: string;
  semester:   string;
  tgl_awal:   string;
  tgl_akhir:  string;
  is_current: boolean;
}

/** The 13 legacy template-image columns on `ajis_semester` (each holds a Blob URL). */
export const SEMESTER_TEMPLATE_FIELDS = [
  'cover', 'cover_siswa', 'kata_pengantar', 'kata_pengantar_siswa',
  'bawah', 'bawah_siswa', 'profil', 'keuangan', 'surat',
  'kotak_profil_ceria', 'kotak_profil_siswa',
  'kotak_pembinaan_ceria', 'kotak_pembinaan_siswa',
] as const;

export type SemesterTemplateField = typeof SEMESTER_TEMPLATE_FIELDS[number];

export type SemesterTemplateUrls = {
  [K in SemesterTemplateField]: string | null;
};

/**
 * Full `ajis_semester` row for the admin CRUD page (`/semester`).
 *
 * `id` is the legacy numeric PK (kept as-is; not migrated to Postgres identity
 * rules since this stays on MySQL). `onprogress` is `enum('n','y')` on the real
 * table (DDL-confirmed), not a tinyint — kept as `'y' | 'n'` here.
 */
export interface Semester extends SemesterTemplateUrls {
  id:         number;
  semesterid: string;
  semester:   string;
  tgl_awal:   string;
  tgl_akhir:  string;
  onprogress: 'y' | 'n';
}

export interface SemesterInput {
  semesterid: string;
  semester:   string;
  tgl_awal:   string;
  tgl_akhir:  string;
  onprogress?: 'y' | 'n';
}
