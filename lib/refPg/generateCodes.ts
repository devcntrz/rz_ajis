/**
 * lib/refPg/generateCodes.ts — legacy-shaped code generators for the
 * administrative reference hierarchy (ref_propinsi → ref_kabupaten →
 * ref_kecamatan → ref_desa), adapted to guarantee GLOBAL uniqueness because
 * the target schema (db/schema/ref.ts) declares each code NOT NULL UNIQUE
 * across the whole table, not merely unique within its parent.
 *
 * Each generated code is `{parentCode}{n-digit zero-padded sequence within
 * that parent}`. Because the parent code itself is globally unique and is
 * always the prefix, the generated code is globally unique by construction
 * — no need to scan the whole table, only the rows under that one parent.
 *
 *   kabid   (varchar(4)):  propid  + 2-digit seq  → e.g. '32' + '01' = '3201'
 *   camatid (varchar(10)): kabid   + 2-digit seq  (legacy GenerateCamatID)
 *   desaid  (varchar(10)): camatid + 1-digit kelurahan flag ('1'/'2') + 3-digit seq
 *                          (legacy GenerateDesaID)
 *
 * All queries are parameterized — the parent code is always bound as a
 * query parameter, never string-concatenated into SQL (CLAUDE.md §2.1).
 */
import { query } from '@/lib/pg';

function padded(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/** Reads the numeric suffix of every existing code under `parentCode` and
 *  returns 1 + the max (or 1 if none exist). `suffixLength` is the number of
 *  trailing digits that hold the sequence (2 for kabid/camatid, 3 for
 *  desaid's numeric tail — the desa flag digit is handled by the caller). */
async function nextSequence(
  table: string,
  codeColumn: string,
  parentColumn: string,
  parentCode: string,
  prefixLength: number,
  suffixLength: number,
): Promise<number> {
  // table/codeColumn/parentColumn are fixed literals passed by the four
  // exported wrappers below, never user input; only parentCode is bound as
  // a query parameter.
  const rows = await query<{ code: string }>(
    `SELECT ${codeColumn} AS code FROM ${table} WHERE ${parentColumn} = $1`,
    [parentCode],
  );

  let max = 0;
  for (const row of rows) {
    const suffix = row.code.slice(prefixLength, prefixLength + suffixLength);
    const n = parseInt(suffix, 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max + 1;
}

/** Error thrown when a generated code would exceed its column's max length —
 *  callers should validate ahead of time (e.g. `propid.length + 2 <= 4`) and
 *  turn this into a friendly 400 rather than letting a raw DB error surface. */
export class GeneratedCodeTooLongError extends Error {
  constructor(public readonly code: string, public readonly maxLength: number) {
    super(`Generated code "${code}" exceeds max length ${maxLength}.`);
    this.name = 'GeneratedCodeTooLongError';
  }
}

/** Next `ref_kabupaten.kabid`: `{propid}{2-digit seq within propid}`. */
export async function generateKabid(propid: string): Promise<string> {
  const seq = await nextSequence('ref_kabupaten', 'kabid', 'propid', propid, propid.length, 2);
  const kabid = `${propid}${padded(seq, 2)}`;
  if (kabid.length > 4) throw new GeneratedCodeTooLongError(kabid, 4);
  return kabid;
}

/** Next `ref_kecamatan.camatid`: `{kabid}{2-digit seq within kabid}` —
 *  legacy `GenerateCamatID`. */
export async function generateCamatid(kabid: string): Promise<string> {
  const seq = await nextSequence('ref_kecamatan', 'camatid', 'kabid', kabid, kabid.length, 2);
  const camatid = `${kabid}${padded(seq, 2)}`;
  if (camatid.length > 10) throw new GeneratedCodeTooLongError(camatid, 10);
  return camatid;
}

/** Next `ref_desa.desaid`: `{camatid}{1-digit kelurahan flag}{3-digit seq
 *  within camatid}` — legacy `GenerateDesaID`. Flag is '1' for kelurahan,
 *  '2' for desa. The sequence counts all rows under the camatid regardless
 *  of flag, matching the legacy numbering (the flag digit is not part of
 *  the sequence itself, just a fixed marker between prefix and sequence). */
export async function generateDesaid(camatid: string, kelurahan: boolean): Promise<string> {
  const flag = kelurahan ? '1' : '2';
  // Sequence is scoped by camatid only; the flag digit sits between the
  // camatid prefix and the 3-digit sequence, so skip 1 extra char for it.
  const seq = await nextSequence('ref_desa', 'desaid', 'camatid', camatid, camatid.length + 1, 3);
  const desaid = `${camatid}${flag}${padded(seq, 3)}`;
  if (desaid.length > 10) throw new GeneratedCodeTooLongError(desaid, 10);
  return desaid;
}
