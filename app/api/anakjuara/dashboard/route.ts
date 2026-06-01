/**
 * GET /api/anakjuara/dashboard
 * Aggregated stats from real DB tables.
 * ajis_pembinaan_baru has one row per child per session.
 * kehadiran = 'y' means hadir.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sql: scope, params } = getScopeCondition(session, 'a');

    // Total anak aktif
    const [anakRow] = await query<{ total_anak: number; total_yatim: number }>(
      `SELECT COUNT(*) AS total_anak,
              SUM(CASE WHEN status_ortu LIKE '%atim%' THEN 1 ELSE 0 END) AS total_yatim
       FROM ajis_anak a
       WHERE aktif = 'y' AND ${scope}`,
      params,
    );

    // Total sesi unik + % kehadiran dari ajis_pembinaan_baru
    const scopePb = getScopeCondition(session, 'pb');
    const [pbRow] = await query<{ total_sesi: number; pct_kehadiran: number }>(
      `SELECT COUNT(DISTINCT pb.id_pembinaan) AS total_sesi,
              ROUND(SUM(CASE WHEN pb.kehadiran='y' THEN 1 ELSE 0 END) /
                    NULLIF(COUNT(*), 0) * 100, 1) AS pct_kehadiran
       FROM ajis_pembinaan_baru pb
       WHERE ${scopePb.sql}`,
      scopePb.params,
    );

    // Tren kehadiran per id_pembinaan (last 8 sessions)
    const trendRows = await query<{
      id_pembinaan: string;
      tgl_pembinaan: string;
      jumlah_hadir: number;
      jumlah_total: number;
    }>(
      `SELECT pb.id_pembinaan, MIN(pb.tgl_pembinaan) AS tgl_pembinaan,
              SUM(CASE WHEN pb.kehadiran='y' THEN 1 ELSE 0 END) AS jumlah_hadir,
              COUNT(*) AS jumlah_total
       FROM ajis_pembinaan_baru pb
       WHERE ${scopePb.sql}
       GROUP BY pb.id_pembinaan
       ORDER BY MIN(pb.tgl_pembinaan) DESC
       LIMIT 8`,
      scopePb.params,
    );

    // Status anak distribution
    const statusRows = await query<{ status_ortu: string; cnt: number }>(
      `SELECT status_ortu, COUNT(*) AS cnt
       FROM ajis_anak a
       WHERE aktif = 'y' AND ${scope}
       GROUP BY status_ortu`,
      params,
    );

    return NextResponse.json({
      data: {
        total_anak:    anakRow?.total_anak ?? 0,
        total_yatim:   anakRow?.total_yatim ?? 0,
        total_sesi:    pbRow?.total_sesi ?? 0,
        pct_kehadiran: pbRow?.pct_kehadiran ?? 0,
        trend:         trendRows.reverse().map((r, i) => ({
          sesi:      `S-${i + 1}`,
          kehadiran: r.jumlah_total > 0 ? Math.round((r.jumlah_hadir / r.jumlah_total) * 100) : 0,
          tgl:       r.tgl_pembinaan,
        })),
        status_pie: statusRows.map(r => ({ name: r.status_ortu, value: r.cnt })),
      },
    });
  } catch (err) {
    console.error('[dashboard]', err);
    return NextResponse.json({ error: 'Gagal memuat dashboard.' }, { status: 500 });
  }
}
