/**
 * lib/penyaluran/schema.ts — request validation for the Penyaluran module.
 */
import { z } from 'zod';

export const batchListQuery = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
  kantor_id: z.string().max(20).optional(),
  id_wilayah_pembinaan: z.string().max(20).optional(),
  bulan: z.coerce.number().int().min(1).max(12).optional(),
  tahun: z.coerce.number().int().optional(),
});
export type BatchListQuery = z.infer<typeof batchListQuery>;

export const anakListQuery = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
  q:     z.string().max(100).optional(),
  kantor_id: z.string().max(20).optional(),
  id_wilayah_pembinaan: z.string().max(20).optional(),
  bulan: z.coerce.number().int().min(1).max(12).optional(),
  tahun: z.coerce.number().int().optional(),
  via_input: z.enum(['massal', 'single']).optional(),
});
export type AnakListQuery = z.infer<typeof anakListQuery>;

export const kandidatQuery = z.object({
  kantorId:   z.string().min(1).optional(),
  wilayahId:  z.string().min(1),
  tahun:      z.coerce.number().int(),
  bulan:      z.coerce.number().int().min(1).max(12),
  q:          z.string().max(100).optional(),
  limit:      z.coerce.number().int().min(1).max(1000).default(500),
});
export type KandidatQuery = z.infer<typeof kandidatQuery>;

export const newBulkPayload = z.object({
  kantorId:  z.string().min(1),
  wilayahId: z.string().min(1),
  bulan:     z.number().int().min(1).max(12),
  tahun:     z.number().int().min(2000).max(2100),
});
export type NewBulkInput = z.infer<typeof newBulkPayload>;

export const newSingleRowPayload = z.object({
  idAnak: z.string().min(1),
});
export type NewSingleRowInput = z.infer<typeof newSingleRowPayload>;

export const editRowPayload = z.object({
  nominalPenyaluran: z.number().nonnegative().optional(),
  nominalHpp:        z.number().nonnegative().optional(),
  bulan:             z.number().int().min(1).max(12).optional(),
  tahun:             z.number().int().min(2000).max(2100).optional(),
  alasan:            z.string().min(5, 'Alasan wajib diisi, minimal 5 karakter.'),
});
export type EditRowInput = z.infer<typeof editRowPayload>;

export const teknisPayload = z.object({
  idPenyaluranBaru: z.string().min(1).optional(),
  tglPenyaluran:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  idSdm:            z.string().min(1),
});
export type TeknisInput = z.infer<typeof teknisPayload>;

export function searchParamsToObject(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  sp.forEach((v, k) => { out[k] = v; });
  return out;
}
