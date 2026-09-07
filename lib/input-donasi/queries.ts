/**
 * lib/input-donasi/queries.ts — read paths for the Input Donasi module.
 *
 * Grid reads straight from `ajis_input_donasi` (PRD §5.1), scoped by kantor_id for a
 * branch user (lib/transaksi/scope.ts::getInputDonasiScope — that table does carry a
 * real kantor_id, unlike `transaksi`). No GROUP BY over the primary key (legacy did
 * `GROUP BY id_input_donasi`, pure waste) and no second SUM pass for the footer beyond
 * what is unavoidable.
 */
import { query, queryOne } from '@/lib/db';
import type { SessionData } from '@/lib/auth';
import { getInputDonasiScope } from '@/lib/transaksi/scope';
import type { ListQuery } from '@/lib/input-donasi/schema';
import type {
  AnakDonasiOption, DonaturOption, InputDonasi, TransaksiDonasiOption,
} from '@/types/input-donasi';

const COLUMNS = `
  a.id_input_donasi, a.id_pemasangan_baru, a.transid, a.detailid,
  a.id_anak, a.nama_anak, a.nik, a.id_donatur, a.nama_donatur,
  a.program_donasi, a.id_program, a.pilihan_donasi, a.qty, a.nominal_donasi,
  a.bulan, a.tahun, a.periode, a.jenis, a.via_input,
  a.kantor_id, a.nama_kantor, a.id_wilayah_pembinaan, a.nama_wilayah,
  a.jenjang_pendidikan, a.jns_kel, a.asnaf, a.tgl_transaksi`;

function buildWhere(q: ListQuery, session: SessionData) {
  const scope = getInputDonasiScope(session, 'a');
  const conditions = [scope.sql];
  const params: unknown[] = [...scope.params];

  if (q.q) {
    conditions.push(`(
      a.nama_anak LIKE ? OR a.nama_kantor LIKE ? OR a.nama_wilayah LIKE ? OR
      a.transid LIKE ? OR a.id_donatur LIKE ? OR a.nama_donatur LIKE ? OR a.id_anak LIKE ?
    )`);
    const like = `%${q.q}%`;
    params.push(like, like, like, like, like, like, like);
  }
  if (q.jenis) { conditions.push('a.jenis = ?'); params.push(q.jenis); }
  if (q.kantor_id) { conditions.push('a.kantor_id = ?'); params.push(q.kantor_id); }
  if (q.id_wilayah_pembinaan) { conditions.push('a.id_wilayah_pembinaan = ?'); params.push(q.id_wilayah_pembinaan); }
  if (q.bulan) { conditions.push('a.bulan = ?'); params.push(String(q.bulan)); }
  if (q.tahun) { conditions.push('a.tahun = ?'); params.push(String(q.tahun)); }
  if (q.kategori) { conditions.push('a.program_donasi LIKE ?'); params.push(`%${q.kategori}%`); }
  if (q.tgl_awal && q.tgl_akhir) {
    conditions.push('a.tgl_transaksi BETWEEN ? AND ?');
    params.push(q.tgl_awal, q.tgl_akhir);
  }

  return { sql: conditions.join(' AND '), params };
}

export async function fetchInputDonasiList(q: ListQuery, session: SessionData) {
  const { sql: WHERE, params } = buildWhere(q, session);

  const [totalRow, footerRow, rows] = await Promise.all([
    queryOne<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_input_donasi a WHERE ${WHERE}`,
      params,
    ),
    queryOne<{ total_nominal_donasi: number | null }>(
      `SELECT COALESCE(SUM(a.nominal_donasi), 0) AS total_nominal_donasi
       FROM ajis_input_donasi a WHERE ${WHERE}`,
      params,
    ),
    query<InputDonasi>(
      `SELECT ${COLUMNS}
       FROM ajis_input_donasi a
       WHERE ${WHERE}
       ORDER BY a.nama_anak ASC, a.id_input_donasi DESC
       LIMIT ? OFFSET ?`,
      [...params, q.limit, (q.page - 1) * q.limit],
    ),
  ]);

  return {
    rows,
    total: totalRow?.total ?? 0,
    footer: { total_nominal_donasi: Number(footerRow?.total_nominal_donasi ?? 0) },
  };
}

/** Donatur_Options(): combogrid pencarian donatur by DID/nama. */
export async function searchDonatur(qStr: string, session: SessionData): Promise<DonaturOption[]> {
  if (!qStr || qStr.trim().length < 2) return [];
  const like = `%${qStr.trim()}%`;
  const scope = getInputDonasiScope(session, 'd');
  // donatur has no kantor_id column matching ajis_input_donasi's; branch scoping here
  // uses kantor_donatur text match against the session's own kantor name is unreliable,
  // so branch users search unscoped donatur (read-only lookup) — the write itself is
  // still scoped by kantor_id on the anak side.
  const rows = await query<DonaturOption>(
    `SELECT did, nama_lengkap, kantor_donatur AS kantor
     FROM donatur d
     WHERE (d.did LIKE ? OR d.nama_lengkap LIKE ?)
     ORDER BY d.nama_lengkap ASC
     LIMIT 20`,
    [like, like],
  );
  void scope;
  return rows;
}

/** Anak_Options(): anak terpasang pada donatur, tahun berjalan, status_pasangan='y'. */
export async function searchAnakByDonatur(
  did: string, qStr: string,
): Promise<AnakDonasiOption[]> {
  if (!did) return [];
  const like = `%${qStr?.trim() ?? ''}%`;
  const tahun = new Date().getFullYear();
  return query<AnakDonasiOption>(
    `SELECT p.id_pemasangan_baru, p.id_anak, p.nama_anak, p.nik,
            p.id_program, p.program_donasi, p.jenjang_pendidikan, p.jns_kel, p.asnaf,
            p.kantor_id, p.nama_kantor, p.id_wilayah_pembinaan, p.nama_wilayah
     FROM ajis_pemasangan p
     WHERE p.id_donatur = ? AND p.status_pasangan = 'y' AND p.tahun = ?
       AND (p.id_anak LIKE ? OR p.nama_anak LIKE ?)
     GROUP BY p.id_anak
     ORDER BY p.nama_anak ASC
     LIMIT 20`,
    [did, tahun, like, like],
  );
}

/**
 * Transaksi_Options(): transaksi milik donatur yang sudah disetujui salur dan berjalan
 * cicilan — satu transaksi bisa dibebani lebih dari satu donasi bulanan.
 */
export async function searchTransaksiByDonatur(did: string): Promise<TransaksiDonasiOption[]> {
  if (!did) return [];
  return query<TransaksiDonasiOption>(
    `SELECT a.transid, a.detailid, a.tgl_transaksi, a.perkiraan_rp,
            a.total_input_donasi, a.selisih_donasi, a.nama_program,
            a.kantor_transaksi, a.kantor_donatur
     FROM transaksi a
     WHERE a.did = ? AND a.review = 'y' AND a.approve_salur = 'y' AND a.cicilan = 'y'
     GROUP BY a.transid, a.detailid
     ORDER BY a.tgl_transaksi DESC
     LIMIT 30`,
    [did],
  );
}
