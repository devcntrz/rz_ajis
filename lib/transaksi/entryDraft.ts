/**
 * lib/transaksi/entryDraft.ts — shared row-shape helpers for the Entry/Update Cashflow
 * forms (EntryCashflowForm, EntryCashflowPremiumForm). Both build the same draft row
 * shape from either candidate or saved-entry data, so the mapping lives once here.
 */
import type { AnakKandidat, EntryRow, InputDonasi } from '@/types/transaksi';

/** A row being edited, plus the child's name for display only. */
export interface DraftRow extends EntryRow {
  nama_anak: string;
}

/** The line total always follows from harga satuan × qty, never a separately-trusted field. */
export function rowNominal(r: Pick<DraftRow, 'pilihan_donasi' | 'qty'>): number {
  return Number(r.pilihan_donasi || 0) * Number(r.qty || 0);
}

export function draftFromCandidate(c: AnakKandidat): DraftRow {
  return {
    id_anak:              c.id_anak,
    nama_anak:            c.nama_anak,
    id_pemasangan_baru:   c.id_pemasangan_baru,
    id_program:           String(c.id_program ?? ''),
    program_donasi:       c.program_donasi,
    kantor_id:            c.kantor_id,
    id_wilayah_pembinaan: c.id_wilayah_pembinaan,
    pilihan_donasi:       Number(c.pilihan_donasi),
    qty:                  Number(c.qty),
    nominal_donasi:       Number(c.nominal_donasi),
  };
}

export function draftFromEntry(e: InputDonasi): DraftRow {
  return {
    id_anak:              e.id_anak,
    nama_anak:            e.nama_anak,
    id_pemasangan_baru:   e.id_pemasangan_baru,
    id_program:           String(e.id_program ?? ''),
    program_donasi:       e.program_donasi,
    kantor_id:            e.kantor_id,
    id_wilayah_pembinaan: e.id_wilayah_pembinaan,
    pilihan_donasi:       Number(e.pilihan_donasi),
    qty:                  Number(e.qty),
    nominal_donasi:       Number(e.nominal_donasi),
  };
}

/** A freshly-added row, qty defaults to 1 at the candidate's list price. */
export function draftFromNewCandidate(c: AnakKandidat): DraftRow {
  return {
    id_anak:              c.id_anak,
    nama_anak:            c.nama_anak,
    id_pemasangan_baru:   c.id_pemasangan_baru,
    id_program:           String(c.id_program ?? ''),
    program_donasi:       c.program_donasi,
    kantor_id:            c.kantor_id,
    id_wilayah_pembinaan: c.id_wilayah_pembinaan,
    pilihan_donasi:       Number(c.pilihan_donasi),
    qty:                  1,
    nominal_donasi:       Number(c.pilihan_donasi),
  };
}
