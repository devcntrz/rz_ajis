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
