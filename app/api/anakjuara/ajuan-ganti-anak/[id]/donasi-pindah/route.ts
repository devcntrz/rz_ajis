/**
 * GET /api/anakjuara/ajuan-ganti-anak/[id]/donasi-pindah
 * Donations eligible to transfer from old child+donor pairing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import type { DonasiPindahRow } from '@/types/ajuan';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const idAjuan = Number(id);
    if (!idAjuan) {
      return NextResponse.json({ error: 'ID ajuan tidak valid.' }, { status: 400 });
    }

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'id_kantor', 'a');
    const ajuan = await queryOne<{
      id_ajuan: number;
      id_anak: string;
      id_donatur: string;
      id_pemasangan_baru: string | null;
    }>(
      `SELECT a.id_ajuan, a.id_anak, a.id_donatur, a.id_pemasangan_baru
       FROM ajis_view_ajuan a
       WHERE a.id_ajuan = ? AND ${scopeSql}
       LIMIT 1`,
      [idAjuan, ...scopeParams],
    );

    if (!ajuan) {
      return NextResponse.json({ error: 'Ajuan tidak ditemukan.' }, { status: 404 });
    }

    const rows = await query<DonasiPindahRow>(
      `SELECT
         d.id_input_donasi, d.id_pemasangan_baru, d.id_anak, d.id_donatur,
         d.program_donasi, d.nominal_donasi, d.bulan, d.tahun, d.tgl_transaksi,
         d.transid, d.detailid, d.qty, d.jenis
       FROM ajis_input_donasi d
       WHERE d.id_anak = ? AND d.id_donatur = ?
         ${ajuan.id_pemasangan_baru ? 'AND d.id_pemasangan_baru = ?' : ''}
       ORDER BY d.tgl_transaksi DESC, d.id_input_donasi DESC
       LIMIT 200`,
      ajuan.id_pemasangan_baru
        ? [ajuan.id_anak, ajuan.id_donatur, ajuan.id_pemasangan_baru]
        : [ajuan.id_anak, ajuan.id_donatur],
    );

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[donasi-pindah]', err);
    return NextResponse.json({ error: 'Gagal memuat donasi.' }, { status: 500 });
  }
}
