/**
 * lib/transaksi/schema.ts — request validation for the Transaksi module.
 *
 * The legacy module built its WHERE clause by concatenating query-string values, and in
 * one case (`opsi_jml_anak_ijis`) the *operator itself* came from the URL. Every operator
 * here is therefore an enum that indexes a fixed lookup table; no string from a client
 * ever reaches the SQL text, only `?` placeholders.
 */

import { z } from 'zod';

/** Comparison operators, mapped to SQL only through these frozen tables. */
export const NUM_OPS = { eq: '=', ne: '<>', lt: '<', gt: '>', lte: '<=', gte: '>=' } as const;
export type NumOp = keyof typeof NUM_OPS;

export const EQ_OPS = { eq: '=', ne: '<>' } as const;
export type EqOp = keyof typeof EQ_OPS;

/** Sortable grid columns, whitelisted so ORDER BY can never take client text. */
export const SORT_COLUMNS = {
  nama_donatur:       'a.nama_donatur',
  tgl_transaksi:      'a.tgl_transaksi',
  tgl_donasi:         'a.tgl_donasi',
  perkiraan_rp:       'a.perkiraan_rp',
  selisih_donasi:     'a.selisih_donasi',
  total_input_donasi: 'a.total_input_donasi',
  nama_program:       'a.nama_program',
  kantor_donatur:     'a.kantor_donatur',
  jml_anak_ijis:      'a.jml_anak_ijis',
  transid:            'a.transid',
} as const;
export type SortColumn = keyof typeof SORT_COLUMNS;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateStr = z.string().regex(DATE_RE, 'Format tanggal harus YYYY-MM-DD');

/** Query-string booleans arrive as '1'/'true'/'y'. */
const boolish = z
  .union([z.boolean(), z.string()])
  .transform(v => v === true || v === '1' || v === 'true' || v === 'y');

export const listQuery = z.object({
  scope: z.enum(['main', 'review', 'cicilan', 'unidentified']).default('main'),
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),

  /** Which date column the range applies to (legacy `filter_tgl` 1/2). */
  date_basis: z.enum(['tgl_transaksi', 'tgl_donasi']).default('tgl_transaksi'),
  tgl_awal:   dateStr.optional(),
  tgl_akhir:  dateStr.optional(),

  q:        z.string().max(100).optional(),
  kategori: z.string().max(100).optional(),

  progid:    z.string().max(20).optional(),
  progid_op: z.enum(['eq', 'ne']).default('eq'),

  nominal:    z.coerce.number().optional(),
  nominal_op: z.enum(['eq', 'ne', 'lt', 'gt']).default('eq'),

  jml_pm:    z.coerce.number().int().optional(),
  jml_pm_op: z.enum(['eq', 'ne']).default('eq'),

  bulan_disantuni:    z.coerce.number().int().optional(),
  bulan_disantuni_op: z.enum(['eq', 'ne']).default('eq'),

  oid_transaksi: z.string().max(10).optional(),
  oid_donatur:   z.string().max(10).optional(),

  bulan_salur: z.coerce.number().int().min(1).max(12).optional(),
  tahun_salur: z.string().max(5).optional(),

  status_pasang: z.enum(['y', 'n']).optional(),
  approve_salur: z.enum(['y', 'n']).optional(),

  only_selisih: boolish.default(false),

  jml_anak_ijis:    z.coerce.number().int().optional(),
  jml_anak_ijis_op: z.enum(['eq', 'ne', 'lt', 'gt', 'lte', 'gte']).default('eq'),

  sort_by:  z.enum(Object.keys(SORT_COLUMNS) as [SortColumn, ...SortColumn[]]).optional(),
  sort_dir: z.enum(['asc', 'desc']).default('asc'),
});

export type ListQuery = z.infer<typeof listQuery>;

/**
 * One split row. `periode`, `jenis`, `via_input`, `bulan`, `tahun` and the denormalised
 * name columns are all derived server-side and are deliberately absent here — accepting
 * them from the browser is what let legacy write inconsistent rows.
 */
export const entryRow = z.object({
  id_anak:              z.string().min(1, 'id_anak wajib diisi').max(25),
  id_pemasangan_baru:   z.string().max(100).default(''),
  id_program:           z.string().max(100).default(''),
  program_donasi:       z.string().max(50).default(''),
  kantor_id:            z.string().max(50).default(''),
  id_wilayah_pembinaan: z.string().max(50).default(''),
  pilihan_donasi:       z.coerce.number().nonnegative(),
  qty:                  z.coerce.number().int().positive('qty harus lebih dari 0'),
  nominal_donasi:       z.coerce.number().nonnegative(),
});

export const entriesPayload = z.object({
  /** 'create' enforces the not-yet-entered guard; 'update' knowingly replaces. */
  mode: z.enum(['create', 'update']).default('create'),
  rows: z.array(entryRow).min(1, 'Minimal satu baris anak harus diisi'),
});

export type EntriesPayload = z.infer<typeof entriesPayload>;

export const approveSalurPayload = z.object({
  bulan_salur:       z.coerce.number().int().min(1).max(12),
  tahun_salur:       z.string().regex(/^\d{4}$/, 'Tahun salur harus 4 digit'),
  approve_salur:     z.enum(['y', 'n']),
  ket_approve_salur: z.string().max(500).default(''),
  cicilan:           z.enum(['y', 'n']).default('n'),
});

export const reviewApprovePayload = z.object({
  /** `transaksi.id_review` = CONCAT(transid, detailid); the bulk-approve key. */
  id_review:         z.array(z.string().min(1).max(50)).min(1, 'Pilih minimal satu transaksi').max(500),
  bulan_salur:       z.coerce.number().int().min(1).max(12),
  tahun_salur:       z.string().regex(/^\d{4}$/, 'Tahun salur harus 4 digit'),
  approve_salur:     z.enum(['y', 'n']),
  ket_approve_salur: z.string().max(500).default(''),
  cicilan:           z.enum(['y', 'n']).default('n'),
});

export const gantiProgramPayload = z.object({
  id_program: z.coerce.number().int().positive(),
});

/** Drop empty query-string values so zod defaults apply instead of failing on ''. */
export function searchParamsToObject(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  sp.forEach((value, key) => {
    if (value !== '') out[key] = value;
  });
  return out;
}

/** First zod issue, phrased for the UI. */
export function firstIssue(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return 'Parameter tidak valid.';
  const path = issue.path.join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
}
