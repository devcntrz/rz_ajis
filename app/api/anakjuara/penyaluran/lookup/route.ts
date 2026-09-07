/**
 * GET /api/anakjuara/penyaluran/lookup — dropdown Kantor/Wilayah (cached master data)
 * dan pencarian SDM (untuk dialog Update Tgl-SDM).
 */
import { NextRequest, NextResponse } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { getAjisKantorOptions, getWilayahList } from '@/lib/cache';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const sdmQ = req.nextUrl.searchParams.get('sdm_q');
    if (sdmQ !== null) {
      const like = `%${sdmQ.trim()}%`;
      const rows = await query<{ id_sdm: string; nama_lengkap: string }>(
        `SELECT DISTINCT CAST(id_sdm AS CHAR) AS id_sdm, nama_lengkap
         FROM ajis_sdm_wilayah
         WHERE (aktif IS NULL OR aktif = '' OR aktif = 'y') AND nama_lengkap LIKE ?
         ORDER BY nama_lengkap ASC LIMIT 20`,
        [like],
      );
      return NextResponse.json({ data: rows });
    }

    const [kantor, wilayah] = await Promise.all([getAjisKantorOptions(), getWilayahList()]);
    return NextResponse.json({ data: { kantor, wilayah } });
  } catch (err) {
    return toErrorResponse('penyaluran lookup', err);
  }
}
