/**
 * lib/transaksi/queries.ts — read paths for the Transaksi module.
 *
 * Optimisation notes vs. the legacy PHP, none of which change what the queries mean:
 *
 * - `total_input_donasi` / `selisih_donasi` are read from the stored columns. Legacy
 *   called getJumlahTotalInputDonasi() twice per grid row (2N extra queries per page);
 *   both columns are already maintained on every write, so recomputing them per row was
 *   pure waste.
 * - No `GROUP BY transid, detailid` on the grid. That pair is the PRIMARY KEY, so the
 *   grouping could never collapse anything — it only forced a temporary table.
 * - Explicit column lists instead of `SELECT a.*` (the table has 61 columns, several of
 *   them TEXT).
 * - Candidate rows get their program price from one LEFT JOIN instead of two
 *   getHargaProgram() round-trips per child.
 */

import { query, queryOne } from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import { getTransaksiScope } from '@/lib/transaksi/scope';
import { EQ_OPS, NUM_OPS, SORT_COLUMNS, type ListQuery } from '@/lib/transaksi/schema';
import type { AnakKandidat, InputDonasi, Transaksi } from '@/types/transaksi';

/** Columns the grid and the detail panel actually consume. */
export const TRANSAKSI_COLUMNS = `
  a.transid, a.detailid, a.jenis_transaksi, a.did, a.nama_donatur,
  a.progid, a.id_program, a.nama_program, a.harga_program, a.perkiraan_rp,
  a.tgl_donasi, a.tgl_transaksi,
  a.oid_transaksi, a.kantor_transaksi, a.oid_donatur, a.kantor_donatur,
  a.jml_mustahik, a.bulan_disantuni, a.keterangan, a.atas_nama,
  a.review, a.approve_salur, a.ket_approve_salur, a.user_approve_salur,
  a.bulan_salur, a.tahun_salur, a.cicilan, a.status_pasang,
  a.total_input_donasi, a.selisih_donasi,
  a.jml_anak_ijis, a.kantor_ijis, a.id_kantor_ijis, a.id_review,
  a.user_insert_cf, a.user_update_cf`;

/**
 * Fixed WHERE base per tab. These are not user filters — they define what the tab *is*,
 * so they are never overridable from the query string.
 */
const SCOPE_BASE: Record<ListQuery['scope'], string> = {
  main: `a.review = 'y' AND a.cicilan = 'n'
         AND a.perkiraan_rp > 0 AND a.approve_salur <> '' AND a.oid_donatur <> ''`,
  // Review queue: everything not yet reviewed.
  review: `a.review <> 'y' AND a.perkiraan_rp > 0`,
  cicilan: `a.cicilan = 'y' AND a.perkiraan_rp > 0`,
  // Donor has no paired children yet, so the money cannot be split anywhere.
  unidentified: `a.id_kantor_ijis = '' AND a.perkiraan_rp > 0 AND a.oid_donatur <> ''`,
};

export interface WhereFragment {
  sql:    string;
  params: unknown[];
}

/**
 * Builds the shared WHERE for every grid tab.
 *
 * Predicate order is deliberate: the tab base and the indexed equality/range predicates
 * come first, and the role scope — which for a branch user ends in a non-indexable
 * FIND_IN_SET — comes last, so it only ever runs against rows that already survived the
 * date range.
 */
export function buildListWhere(q: ListQuery, session: SessionData): WhereFragment {
  const conditions: string[] = [SCOPE_BASE[q.scope]];
  const params: unknown[] = [];

  // Date range on the caller's chosen basis. `date_basis` is an enum, so interpolating
  // it here cannot introduce anything but one of two known column names.
  const dateCol = `a.${q.date_basis}`;
  if (q.tgl_awal && q.tgl_akhir) {
    conditions.push(`${dateCol} BETWEEN ? AND ?`);
    params.push(q.tgl_awal, q.tgl_akhir);
  } else if (q.tgl_awal) {
    conditions.push(`${dateCol} >= ?`);
    params.push(q.tgl_awal);
  } else if (q.tgl_akhir) {
    conditions.push(`${dateCol} <= ?`);
    params.push(q.tgl_akhir);
  }

  if (q.q) {
    conditions.push(`(
      a.nama_donatur LIKE ? OR a.kantor_donatur LIKE ? OR a.kantor_transaksi LIKE ?
      OR a.transid LIKE ? OR a.did LIKE ? OR a.perkiraan_rp LIKE ? OR a.kantor_ijis LIKE ?
    )`);
    const like = `%${q.q}%`;
    params.push(like, like, like, like, like, like, like);
  }

  if (q.kategori) {
    conditions.push('a.nama_program LIKE ?');
    params.push(`%${q.kategori}%`);
  }

  if (q.progid) {
    conditions.push(`a.progid ${EQ_OPS[q.progid_op]} ?`);
    params.push(q.progid);
  }

  if (q.nominal !== undefined) {
    conditions.push(`a.perkiraan_rp ${NUM_OPS[q.nominal_op]} ?`);
    params.push(q.nominal);
  }

  if (q.jml_pm !== undefined) {
    conditions.push(`a.jml_mustahik ${EQ_OPS[q.jml_pm_op]} ?`);
    params.push(String(q.jml_pm));
  }

  if (q.bulan_disantuni !== undefined) {
    conditions.push(`a.bulan_disantuni ${EQ_OPS[q.bulan_disantuni_op]} ?`);
    params.push(String(q.bulan_disantuni));
  }

  if (q.oid_transaksi) {
    conditions.push('a.oid_transaksi = ?');
    params.push(q.oid_transaksi);
  }
  if (q.oid_donatur) {
    conditions.push('a.oid_donatur = ?');
    params.push(q.oid_donatur);
  }

  if (q.bulan_salur !== undefined) {
    conditions.push('a.bulan_salur = ?');
    params.push(String(q.bulan_salur));
  }
  if (q.tahun_salur) {
    conditions.push('a.tahun_salur = ?');
    params.push(q.tahun_salur);
  }

  if (q.status_pasang) {
    conditions.push('a.status_pasang = ?');
    params.push(q.status_pasang);
  }

  // On the main tab `approve_salur` is also part of the branch scope; the two agree
  // rather than conflict, so applying both is safe.
  if (q.approve_salur) {
    conditions.push('a.approve_salur = ?');
    params.push(q.approve_salur);
  }

  if (q.only_selisih) {
    conditions.push('a.selisih_donasi <> 0');
  }

  if (q.jml_anak_ijis !== undefined) {
    conditions.push(`a.jml_anak_ijis ${NUM_OPS[q.jml_anak_ijis_op]} ?`);
    params.push(q.jml_anak_ijis);
  }

  const scope = getTransaksiScope(session, 'a');
  conditions.push(scope.sql);
  params.push(...scope.params);

  return { sql: conditions.join('\n  AND '), params };
}

function buildOrderBy(q: ListQuery): string {
  if (q.sort_by) {
    const dir = q.sort_dir === 'desc' ? 'DESC' : 'ASC';
    return `${SORT_COLUMNS[q.sort_by]} ${dir}`;
  }
  // Newest first. Legacy defaulted to `nama_donatur ASC`, which buries recent work at
  // whatever position the alphabet puts it — and a large share of rows have an empty
  // `nama_donatur`, so that ordering was largely arbitrary anyway. `detailid` breaks
  // ties so paging stays stable across requests.
  return 'a.tgl_transaksi DESC, a.transid DESC, a.detailid ASC';
}

export interface ListResult {
  rows:   Transaksi[];
  total:  number;
  footer: { total_perkiraan_rp: number };
}

/**
 * Grid page + row count + footer sum, all three issued concurrently.
 *
 * The footer intentionally does NOT match the visible rows: legacy sums only
 * `approve_salur='y' AND review='y' AND cicilan='n'` on top of the same filters, so on a
 * tab like Review the footer total is smaller than the rows on screen. Reproduced as-is;
 * the UI labels it so the difference does not read as a bug.
 */
export async function fetchTransaksiList(
  q: ListQuery,
  session: SessionData,
): Promise<ListResult> {
  const { sql: WHERE, params } = buildListWhere(q, session);
  const offset = (q.page - 1) * q.limit;

  const [rows, countRow, footerRow] = await Promise.all([
    query<Transaksi>(
      `SELECT ${TRANSAKSI_COLUMNS}
       FROM transaksi a
       WHERE ${WHERE}
       ORDER BY ${buildOrderBy(q)}
       LIMIT ? OFFSET ?`,
      [...params, q.limit, offset],
    ),
    queryOne<{ total: number }>(
      `SELECT COUNT(*) AS total FROM transaksi a WHERE ${WHERE}`,
      params,
    ),
    queryOne<{ total: number | null }>(
      `SELECT COALESCE(SUM(a.perkiraan_rp), 0) AS total
       FROM transaksi a
       WHERE ${WHERE}
         AND a.approve_salur = 'y' AND a.review = 'y' AND a.cicilan = 'n'`,
      params,
    ),
  ]);

  return {
    rows,
    total:  Number(countRow?.total ?? 0),
    footer: { total_perkiraan_rp: Number(footerRow?.total ?? 0) },
  };
}

/**
 * One transaction by its composite key, with the role scope applied so a branch user
 * cannot reach a row by guessing its transid.
 */
export async function fetchTransaksi(
  transid: string,
  detailid: number,
  session: SessionData,
): Promise<Transaksi | null> {
  const scope = getTransaksiScope(session, 'a');
  return queryOne<Transaksi>(
    `SELECT ${TRANSAKSI_COLUMNS}
     FROM transaksi a
     WHERE a.transid = ? AND a.detailid = ? AND ${scope.sql}
     LIMIT 1`,
    [transid, detailid, ...scope.params],
  );
}

export const INPUT_DONASI_COLUMNS = `
  a.id_input_donasi, a.id_pemasangan_baru, a.transid, a.detailid,
  a.id_anak, a.nama_anak, a.nik, a.id_donatur, a.nama_donatur,
  a.program_donasi, a.id_program, a.pilihan_donasi, a.qty, a.nominal_donasi,
  a.bulan, a.tahun, a.periode, a.jenis, a.via_input,
  a.kantor_id, a.nama_kantor, a.id_wilayah_pembinaan, a.nama_wilayah,
  a.jenjang_pendidikan, a.jns_kel, a.asnaf, a.tgl_transaksi`;

/** Saved split rows for one transaction (legacy `r_kantor_update`). */
export async function fetchEntries(
  transid: string,
  detailid: number,
): Promise<InputDonasi[]> {
  return query<InputDonasi>(
    `SELECT ${INPUT_DONASI_COLUMNS}
     FROM ajis_input_donasi a
     WHERE a.transid = ? AND a.detailid = ?
     ORDER BY a.nama_anak ASC`,
    [transid, detailid],
  );
}

/**
 * Children eligible to receive part of this transaction: active pairings of the same
 * donor, on the same program, in the salur year (legacy `Penyaluran_ReadAnak`).
 *
 * `setting_program` has the composite PK (id_program, progid), so joining on id_program
 * alone can match several rows; MAX() inside the existing GROUP BY collapses them
 * instead of multiplying the child rows.
 */
export async function fetchCandidates(opts: {
  idDonatur:   string;
  namaProgram: string;
  tahun:       string;
  qty:         number;
}): Promise<AnakKandidat[]> {
  const rows = await query<AnakKandidat & { harga: number }>(
    `SELECT a.id_pemasangan_baru, a.id_anak, a.nama_anak, a.nik, a.id_donatur,
            a.program_donasi, a.id_program,
            a.jenjang_pendidikan, a.jns_kel, a.asnaf,
            a.kantor_id, a.nama_kantor, a.id_wilayah_pembinaan, a.nama_wilayah,
            COALESCE(MAX(s.harga_program), MAX(a.harga_program), 0) AS harga
     FROM ajis_pemasangan a
     LEFT JOIN setting_program s ON s.id_program = a.id_program
     WHERE a.id_donatur = ? AND a.program_donasi = ? AND a.tahun = ?
       AND a.status_pasangan = 'y'
     GROUP BY a.id_pemasangan_baru
     ORDER BY a.nama_anak ASC`,
    [opts.idDonatur, opts.namaProgram, opts.tahun],
  );

  const qty = opts.qty > 0 ? opts.qty : 1;
  return rows.map(r => {
    const pilihan = Number(r.harga ?? 0);
    return {
      id_pemasangan_baru:   r.id_pemasangan_baru,
      id_anak:              r.id_anak,
      nama_anak:            r.nama_anak,
      nik:                  r.nik,
      id_donatur:           r.id_donatur,
      program_donasi:       r.program_donasi,
      id_program:           r.id_program,
      jenjang_pendidikan:   r.jenjang_pendidikan,
      jns_kel:              r.jns_kel,
      asnaf:                r.asnaf,
      kantor_id:            r.kantor_id,
      nama_kantor:          r.nama_kantor,
      id_wilayah_pembinaan: r.id_wilayah_pembinaan,
      nama_wilayah:         r.nama_wilayah,
      pilihan_donasi:       pilihan,
      qty,
      nominal_donasi:       pilihan * qty,
    };
  });
}
