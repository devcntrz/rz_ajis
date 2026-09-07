/**
 * lib/input-donasi/schema.ts — request validation for the Input Donasi module.
 *
 * Mirrors lib/transaksi/schema.ts conventions: every filter is a typed, bounded field,
 * never raw SQL text from the client.
 */
import { z } from 'zod';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateStr = z.string().regex(DATE_RE, 'Format tanggal harus YYYY-MM-DD');

export const listQuery = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),

  q:        z.string().max(100).optional(),
  jenis:    z.enum(['trans', 'saldo']).optional(),
  kantor_id: z.string().max(20).optional(),
  id_wilayah_pembinaan: z.string().max(20).optional(),
  bulan:    z.coerce.number().int().min(1).max(12).optional(),
  tahun:    z.coerce.number().int().optional(),
  kategori: z.string().max(100).optional(),
  tgl_awal:  dateStr.optional(),
  tgl_akhir: dateStr.optional(),
});
export type ListQuery = z.infer<typeof listQuery>;

export const newSinglePayload = z.object({
  did:                z.string().min(1),
  idAnak:              z.string().min(1),
  idPemasanganBaru:    z.string().min(1),
  idProgram:           z.string().min(1),
  programDonasi:       z.string().min(1),
  kantorId:            z.string().min(1),
  idWilayahPembinaan:  z.string().min(1),
  transid:             z.string().min(1),
  detailid:            z.number().int().nonnegative(),
  tglTransaksi:        dateStr,
  bulan:               z.number().int().min(1).max(12),
  tahun:               z.number().int().min(2000).max(2100),
  qty:                 z.number().int().positive().default(1),
  pilihanDonasi:       z.number().positive(),
});
export type NewSinglePayload = z.infer<typeof newSinglePayload>;

export function searchParamsToObject(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  sp.forEach((v, k) => { out[k] = v; });
  return out;
}

export function firstIssue(err: { issues: { message: string }[] }): string {
  return err.issues[0]?.message ?? 'Data tidak valid.';
}
