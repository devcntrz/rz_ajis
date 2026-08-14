/**
 * GET /api/anakjuara/anak-juara/keuangan?ids=a,b,c
 * Jan–Des finance pivot for the Anak Juara grid, PRD §9.4: aggregate ONLY the
 * id_pemasangan_baru values on the current page instead of scanning the nested
 * ajis_view_anak_juara. Three indexed aggregates, merged in the API layer.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12 } from '@/lib/auth';
import {
  buildKeuangan,
  pivotByPairing,
  type BulanAgg,
  type OpnameAgg,
  type KeuanganPivot,
} from '@/lib/keuangan';

/** Page size caps this; keeps the IN() list bounded. */
const MAX_IDS = 200;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      requireGroup12(session);
    } catch {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    const ids = (req.nextUrl.searchParams.get('ids') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, MAX_IDS);

    if (ids.length === 0) {
      return NextResponse.json({ data: {} });
    }

    const ph = ids.map(() => '?').join(',');

    const [donasiRows, penyaluranRows, opnameRows, hargaRows] = await Promise.all([
      query<BulanAgg>(
        `SELECT id_pemasangan_baru, bulan, SUM(IFNULL(nominal_donasi, 0)) AS total
         FROM ajis_input_donasi
         WHERE id_pemasangan_baru IN (${ph}) AND jenis = 'trans'
         GROUP BY id_pemasangan_baru, bulan`,
        ids,
      ),
      query<BulanAgg>(
        `SELECT id_pemasangan_baru, bulan, SUM(IFNULL(nominal_penyaluran, 0)) AS total
         FROM ajis_penyaluran
         WHERE id_pemasangan_baru IN (${ph})
         GROUP BY id_pemasangan_baru, bulan`,
        ids,
      ),
      query<OpnameAgg>(
        `SELECT id_pemasangan_baru,
                saldo_awal_ganjil, saldo_akhir_ganjil, saldo_awal_genap, saldo_akhir_genap,
                date_opname_ganjil, user_opname_ganjil, date_opname_genap, user_opname_genap
         FROM ajis_opname
         WHERE id_pemasangan_baru IN (${ph})`,
        ids,
      ),
      query<{ id_pemasangan_baru: string; harga_program: number }>(
        `SELECT id_pemasangan_baru, harga_program
         FROM ajis_pemasangan
         WHERE id_pemasangan_baru IN (${ph})`,
        ids,
      ),
    ]);

    const donasi = pivotByPairing(donasiRows);
    const penyaluran = pivotByPairing(penyaluranRows);
    const opname = new Map(opnameRows.map(o => [String(o.id_pemasangan_baru), o]));
    const harga = new Map(hargaRows.map(h => [String(h.id_pemasangan_baru), Number(h.harga_program) || 0]));

    const data: Record<string, KeuanganPivot> = {};
    for (const id of ids) {
      data[id] = buildKeuangan(donasi[id], penyaluran[id], opname.get(id), harga.get(id) ?? 0);
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[anak-juara keuangan]', err);
    return NextResponse.json({ error: 'Gagal memuat data keuangan.' }, { status: 500 });
  }
}
