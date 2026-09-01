/**
 * lib/enums.ts — allowed values for every legacy enum column that survived the
 * MySQL→Postgres conversion as varchar + CHECK (PRD §6.2).
 *
 * Zero imports on purpose. Two consumers share this one source of truth:
 *   · db/schema/_shared.ts  builds CHECK constraints from it
 *   · route handlers        build Zod validators from it (z.enum(STATUS_QC))
 *
 * Columns that became `boolean` do NOT appear here — see BOOLEAN_MAPS in
 * scripts/dump-to-fixtures.mjs for how their legacy encodings are read.
 *
 * The distinction that matters: `enum('y','t')` and `enum('t','n','y')` are NOT
 * booleans. 't' means *pending*, not *false*. Flattening it loses a state.
 */

/** enum('y','t') — 'y' approved, 't' pending. */
export const YT = ['y', 't'] as const;
export type YT = (typeof YT)[number];

/** enum('t','n','y') — three-state QC: pending / rejected / accepted. */
export const TNY = ['t', 'n', 'y'] as const;
export type TNY = (typeof TNY)[number];

/** Jenis kelamin. Legacy stores 'l' / 'p' (and uppercase in older rows). */
export const JNS_KEL = ['l', 'p'] as const;
export type JnsKel = (typeof JNS_KEL)[number];

/** ajis_anak.status_anak_juara — caj = calon anak juara, aj = anak juara. */
export const STATUS_ANAK_JUARA = ['caj', 'aj', 'non'] as const;
export type StatusAnakJuara = (typeof STATUS_ANAK_JUARA)[number];

/** ajis_anak.status_tersantuni. */
export const STATUS_TERSANTUNI = ['su', 'b', 'se', 't'] as const;

/** Jenjang pendidikan. */
export const JENJANG = ['sd', 'smp', 'sma', 'smk', 'mi', 'mts', 'ma', 'pt'] as const;

/** manual_laporan.versi_struktur — 'lama' marks rows merged from manual_laporan_lama (§6.5). */
export const VERSI_STRUKTUR = ['lama', 'baru'] as const;

/** ajis_pembinaan_baru.keaktifan_edukasi — enum('y','t'), pending-capable. */
export const KEAKTIFAN_EDUKASI = YT;

/** Approval flags carried over as enum('y','t'). */
export const STATUS_APPROVE = YT;
