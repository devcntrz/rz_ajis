/**
 * lib/cache.ts — unstable_cache wrappers for master data
 */
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/db';
import type { HafalanItem } from '@/types/hafalan';

/** Hafalan master items — cached 1 hour (immutable master data) */
export const getHafalanItems = unstable_cache(
  async () =>
    query<HafalanItem>(
      'SELECT id, jenis, konten FROM ajis_item_hafalan ORDER BY jenis, id',
    ),
  ['hafalan-items'],
  { revalidate: 3600, tags: ['hafalan-master'] },
);

/** Wilayah list — cached 1 hour */
export const getWilayahList = unstable_cache(
  async () =>
    query<{ id_wilayah_pembinaan: number; nama_wilayah: string; kantor_id: string }>(
      `SELECT id_wilayah_pembinaan, MIN(nama_wilayah) AS nama_wilayah, MIN(kantor_id) AS kantor_id
       FROM ajis_wilayah_pembinaan
       WHERE aktif = 'y'
       GROUP BY id_wilayah_pembinaan
       ORDER BY nama_wilayah`,
    ),
  ['wilayah-list'],
  { revalidate: 3600, tags: ['wilayah-master'] },
);

/* ── Transaksi module lookups (legacy m=kantor / kantor_trans / program) ────────── */

/** IJIS coaching offices — the "Kantor" dropdown. */
export const getAjisKantorOptions = unstable_cache(
  async () =>
    query<{ oid: string; kantor: string }>(
      `SELECT oid, MIN(kantor) AS kantor
       FROM ajis_kantor
       WHERE oid IS NOT NULL AND oid <> ''
       GROUP BY oid
       ORDER BY kantor`,
    ),
  ['ajis-kantor-options'],
  { revalidate: 3600, tags: ['kantor-master'] },
);

/**
 * Transaction/donor offices. Legacy excluded the pseudo-offices that never hold Anak
 * Juara pairings (superinfak, regional, call centre, channeling) so they would not
 * clutter the picker.
 */
export const getKantorTransOptions = unstable_cache(
  async () =>
    query<{ oid: string; kantor: string }>(
      `SELECT oid, kantor
       FROM kantor
       WHERE aktif = 'y'
         AND kantor NOT LIKE '%superinfak%'
         AND kantor NOT LIKE '%regional%'
         AND kantor NOT LIKE '%call%'
         AND kantor NOT LIKE '%channeling%'
       ORDER BY kantor`,
    ),
  ['kantor-trans-options'],
  { revalidate: 3600, tags: ['kantor-master'] },
);

/**
 * Active donation programs. `setting_program` has the composite PK
 * (id_program, progid), so rows are collapsed to one entry per id_program.
 */
export const getProgramOptions = unstable_cache(
  async () =>
    query<{ id_program: number; progid: string; nama_program: string; harga_program: number }>(
      `SELECT id_program,
              MIN(progid)        AS progid,
              MIN(nama_program)  AS nama_program,
              MAX(harga_program) AS harga_program
       FROM setting_program
       WHERE aktif = 'y'
       GROUP BY id_program
       ORDER BY nama_program`,
    ),
  ['program-options'],
  { revalidate: 3600, tags: ['program-master'] },
);
