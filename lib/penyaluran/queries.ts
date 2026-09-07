/**
 * lib/penyaluran/queries.ts — read paths for the Penyaluran module.
 *
 * Grid batch (tab Wilayah) uses one aggregate query (PRD §7.3) instead of legacy's 17
 * per-row sub-queries. Detail batch and tab Anak read straight from `ajis_penyaluran`
 * with an explicit column list (never `ap.*` on a 39-column table).
 *
 * `ajis_penyaluran` is MyISAM (table-level locking, no index on `tahun`/`id_kantor`/
 * `id_wilayah_pembinaan`) and adding an index is explicitly out of scope — no schema
 * change to the legacy table is allowed. Measured directly against production: a bare
 * `COUNT(*)` with no WHERE at all did not return within 30s. Two things follow from
 * that, applied throughout this file:
 *  1. Never run a separate COUNT query. `fetchBatchList`/`fetchAnakList` fetch one row
 *     past `limit` instead and report `hasMore` — an exact total is not worth a second
 *     full scan of the same filtered set.
 *  2. Every read here is wrapped in `unstable_cache` (60s) so the unavoidable scan for
 *     a given filter combination runs at most once a minute for the whole app, not once
 *     per page view. Mutations call `revalidatePenyaluranCache()` so a user's own write
 *     is reflected immediately instead of waiting out the window.
 */
import { unstable_cache, revalidateTag } from 'next/cache';
import { query } from '@/lib/db';
import { RuleError } from '@/lib/transaksi/rules';
import type { SessionData } from '@/lib/auth';
import { getKantorScope } from '@/lib/auth';
import type { BatchListQuery, AnakListQuery } from '@/lib/penyaluran/schema';
import type { PenyaluranBatch, PenyaluranRow } from '@/types/penyaluran';

const CACHE_SECONDS = 60;
const BATCH_TAG = 'penyaluran-batch';
const ANAK_TAG = 'penyaluran-anak';
const DETAIL_TAG = 'penyaluran-detail';

/**
 * `ajis_penyaluran` reads have been observed to hang for minutes on production — not
 * "slow", genuinely unresponsive, most likely MyISAM table-level lock contention with
 * the still-running legacy PHP app's writes. No amount of query rewriting fixes a lock
 * wait, and no index change is allowed. What IS in reach: never let a request hang the
 * UI forever. `query()` here always races against this timeout, so a stuck read fails
 * fast with a message the user can act on (retry) instead of an endless skeleton.
 */
const QUERY_TIMEOUT_MS = 8_000;

async function queryTimed<T>(sql: string, params: unknown[]): Promise<T[]> {
  return Promise.race([
    query<T>(sql, params),
    new Promise<never>((_, reject) => setTimeout(
      () => reject(new RuleError(
        'Database sedang sangat sibuk dan tidak merespons. Coba lagi beberapa saat lagi, ' +
        'atau persempit filter (kantor/wilayah/bulan) untuk mengurangi beban query.',
      )),
      QUERY_TIMEOUT_MS,
    )),
  ]);
}

/** Cache key must fold in the caller's effective RBAC scope, not just the filters. */
function scopeKey(session: SessionData): string {
  return session.idGroupUser === 2 ? `k${session.idKantor}` : 'admin';
}

const ROW_COLUMNS = `
  ap.id_row, ap.id_penyaluran, ap.id_pemasangan_baru, ap.id_anak, ap.nama_anak, ap.nik,
  ap.jenjang_pendidikan, ap.kelas, ap.jns_kel, ap.asnaf, ap.id_donatur, ap.nama_donatur,
  ap.id_kantor, ap.nama_kantor, ap.id_wilayah_pembinaan, ap.nama_wilayah,
  ap.program_donasi, ap.nominal_penyaluran, ap.nominal_hpp, ap.bulan, ap.tahun, ap.periode,
  ap.via_input, ap.tgl_penyaluran, ap.no_rekening, ap.nama_bank, ap.pemilik_rekening`;

/** `ajis_penyaluran` scopes by `id_kantor`, unlike `ajis_anak`/`ajis_pemasangan` (`kantor_id`). */
function batchScope(session: SessionData) {
  const { sql, params } = getKantorScope(session, 'id_kantor', 'ap');
  return { sql, params };
}

/**
 * Bounds an unfiltered admin query to the current year by default. Without it, a plain
 * page load (no filters) aggregates the entire 493k-row table — that full scan, not the
 * network or React, is what makes the grid feel stuck on its loading skeleton. Filters
 * still override it; this only fills the gap when the caller sent none.
 */
function defaultTahun(tahun: number | undefined): number {
  return tahun ?? new Date().getFullYear();
}

async function runBatchList(q: BatchListQuery, session: SessionData) {
  const scope = batchScope(session);
  const conditions = [scope.sql, 'ap.tahun = ?'];
  const params: unknown[] = [...scope.params, String(defaultTahun(q.tahun))];

  if (q.kantor_id) { conditions.push('ap.id_kantor = ?'); params.push(q.kantor_id); }
  if (q.id_wilayah_pembinaan) { conditions.push('ap.id_wilayah_pembinaan = ?'); params.push(q.id_wilayah_pembinaan); }
  if (q.bulan) { conditions.push('ap.bulan = ?'); params.push(String(q.bulan)); }

  const WHERE = conditions.join(' AND ');

  // One row past `limit` tells us whether there is a next page, without a second
  // full-table COUNT — on this table (MyISAM, no index on tahun/id_kantor) a bare
  // COUNT(*) measured over 30s against production. Every column not wrapped in an
  // aggregate must be, or MySQL's ONLY_FULL_GROUP_BY mode rejects the query outright.
  const rows = await queryTimed<Omit<PenyaluranBatch, 'nama_sdm'>>(
    `SELECT ap.id_penyaluran, MIN(ap.id_kantor) AS id_kantor, MIN(ap.nama_kantor) AS nama_kantor,
            MIN(ap.id_wilayah_pembinaan) AS id_wilayah_pembinaan, MIN(ap.nama_wilayah) AS nama_wilayah,
            MIN(ap.bulan) AS bulan, MIN(ap.tahun) AS tahun, MIN(ap.periode) AS periode,
            MIN(ap.status_akhir) AS status_akhir, MIN(ap.tgl_penyaluran) AS tgl_penyaluran,
            MIN(ap.id_sdm) AS id_sdm,
            COUNT(*) AS jumlah_anak,
            SUM(ap.nominal_penyaluran) AS jumlah_penyaluran,
            SUM(ap.nominal_hpp) AS jumlah_hpp,
            SUM(ap.jenjang_pendidikan LIKE '%SD%') AS jumlah_sd,
            SUM(ap.jenjang_pendidikan LIKE '%SMP%') AS jumlah_smp,
            SUM(ap.jenjang_pendidikan LIKE '%SMA%' OR ap.jenjang_pendidikan LIKE '%SMK%') AS jumlah_sma,
            SUM(ap.jenjang_pendidikan LIKE '%Mahasiswa%' OR ap.jenjang_pendidikan LIKE '%PT%') AS jumlah_pt
     FROM ajis_penyaluran ap
     WHERE ${WHERE}
     GROUP BY ap.id_penyaluran
     ORDER BY MIN(ap.tgl_penyaluran) DESC, ap.id_penyaluran DESC
     LIMIT ? OFFSET ?`,
    [...params, q.limit + 1, (q.page - 1) * q.limit],
  );

  const hasMore = rows.length > q.limit;
  const page = rows.slice(0, q.limit);

  // SDM names looked up only for the handful of batches on this page, not joined into
  // the table-wide aggregate above (that join used to run once per source row).
  const sdmIds = [...new Set(page.map(r => r.id_sdm).filter((id): id is string => !!id))];
  const sdmNames = sdmIds.length === 0 ? new Map<string, string>() : new Map(
    (await query<{ id_sdm: string; nama_lengkap: string }>(
      `SELECT DISTINCT CAST(id_sdm AS CHAR) AS id_sdm, nama_lengkap
       FROM ajis_sdm_wilayah WHERE CAST(id_sdm AS CHAR) IN (${sdmIds.map(() => '?').join(',')})`,
      sdmIds,
    )).map(s => [s.id_sdm, s.nama_lengkap]),
  );

  const withSdm: PenyaluranBatch[] = page.map(r => ({
    ...r, nama_sdm: r.id_sdm ? sdmNames.get(String(r.id_sdm)) ?? null : null,
  }));

  return { rows: withSdm, hasMore };
}

export async function fetchBatchList(q: BatchListQuery, session: SessionData) {
  const cached = unstable_cache(
    () => runBatchList(q, session),
    ['penyaluran-batch', scopeKey(session), JSON.stringify(q)],
    { revalidate: CACHE_SECONDS, tags: [BATCH_TAG] },
  );
  return cached();
}

async function runBatchDetail(
  idPenyaluran: string, session: SessionData,
): Promise<PenyaluranRow[]> {
  const scope = batchScope(session);
  return queryTimed<PenyaluranRow>(
    `SELECT ${ROW_COLUMNS}
     FROM ajis_penyaluran ap
     WHERE ap.id_penyaluran = ? AND ${scope.sql}
     ORDER BY ap.nama_anak ASC`,
    [idPenyaluran, ...scope.params],
  );
}

/** One batch's own rows — cheap (equality on the PK's leading… actually second column,
 *  still far fewer rows than the whole table) but still cached to spare repeat opens. */
export async function fetchBatchDetail(
  idPenyaluran: string, session: SessionData,
): Promise<PenyaluranRow[]> {
  const cached = unstable_cache(
    () => runBatchDetail(idPenyaluran, session),
    ['penyaluran-detail', scopeKey(session), idPenyaluran],
    { revalidate: CACHE_SECONDS, tags: [DETAIL_TAG, `${DETAIL_TAG}:${idPenyaluran}`] },
  );
  return cached();
}

async function runAnakList(q: AnakListQuery, session: SessionData) {
  const scope = batchScope(session);
  // Same reasoning as fetchBatchList: an unbounded ORDER BY nama_anak over the whole
  // 493k-row table is the actual cost. A keyword search narrows the row set enough on
  // its own (LIKE still scans, but the result set it sorts is what the user asked for);
  // otherwise default to the current year so a plain page load stays cheap.
  const conditions = [scope.sql];
  const params: unknown[] = [...scope.params];

  if (q.q) {
    conditions.push('(ap.nama_anak LIKE ? OR ap.id_anak LIKE ? OR ap.nama_donatur LIKE ?)');
    const like = `%${q.q}%`;
    params.push(like, like, like);
    if (q.tahun) { conditions.push('ap.tahun = ?'); params.push(String(q.tahun)); }
  } else {
    conditions.push('ap.tahun = ?');
    params.push(String(defaultTahun(q.tahun)));
  }
  if (q.kantor_id) { conditions.push('ap.id_kantor = ?'); params.push(q.kantor_id); }
  if (q.id_wilayah_pembinaan) { conditions.push('ap.id_wilayah_pembinaan = ?'); params.push(q.id_wilayah_pembinaan); }
  if (q.bulan) { conditions.push('ap.bulan = ?'); params.push(String(q.bulan)); }
  if (q.via_input) { conditions.push('ap.via_input = ?'); params.push(q.via_input); }

  const WHERE = conditions.join(' AND ');

  // Same limit+1 trick as fetchBatchList — no COUNT(*) on this table.
  const rows = await queryTimed<PenyaluranRow>(
    `SELECT ${ROW_COLUMNS}
     FROM ajis_penyaluran ap
     WHERE ${WHERE}
     ORDER BY ap.nama_anak ASC, ap.id_row DESC
     LIMIT ? OFFSET ?`,
    [...params, q.limit + 1, (q.page - 1) * q.limit],
  );

  const hasMore = rows.length > q.limit;
  return { rows: rows.slice(0, q.limit), hasMore };
}

export async function fetchAnakList(q: AnakListQuery, session: SessionData) {
  const cached = unstable_cache(
    () => runAnakList(q, session),
    ['penyaluran-anak', scopeKey(session), JSON.stringify(q)],
    { revalidate: CACHE_SECONDS, tags: [ANAK_TAG] },
  );
  return cached();
}

/** Called by lib/penyaluran/mutations.ts after any write, so an operator sees their own
 *  change immediately instead of waiting out the 60s cache window. */
export async function revalidatePenyaluranCache(idPenyaluran?: string) {
  // Next 16's revalidateTag now takes a required cache-life profile as its 2nd arg;
  // `{ expire: 0 }` just means "this tag's entries are stale immediately".
  const profile = { expire: 0 };
  revalidateTag(BATCH_TAG, profile);
  revalidateTag(ANAK_TAG, profile);
  if (idPenyaluran) revalidateTag(`${DETAIL_TAG}:${idPenyaluran}`, profile);
}
