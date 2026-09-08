/**
 * GET /api/anakjuara/laporan-semester/export — Excel export of the Rekap tab,
 * analog of legacy `RekapTerbuat_Xls()`. Reuses lib/excel.ts, same pattern as
 * app/api/anakjuara/anak-juara/export/route.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchRekapByKantor } from '@/lib/laporanSemester/queries';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';

const COLUMNS: ExcelColumn[] = [
  { key: 'oid', header: 'Kode Kantor' },
  { key: 'kantor', header: 'Nama Kantor' },
  { key: 'jml_laporan', header: 'Jumlah Laporan' },
  { key: 'jml_status_terbuat', header: 'Laporan Terbuat' },
  { key: 'persentase', header: 'Persentase (%)' },
  { key: 'jml_foto', header: 'Foto Anak' },
  { key: 'jml_foto_pembinaan', header: 'Foto Pembinaan' },
  { key: 'jml_raport_ceria', header: 'Raport Ceria' },
  { key: 'jml_raport_satu', header: 'Raport 1' },
  { key: 'jml_raport_dua', header: 'Raport 2' },
  { key: 'jml_surat_suara_hati', header: 'Surat Suara Hati' },
  { key: 'jml_dana_saldo_awal', header: 'Dana Saldo Awal Terisi' },
  { key: 'jml_dana_penerimaan', header: 'Dana Penerimaan Terisi' },
  { key: 'jml_dana_penyaluran', header: 'Dana Penyaluran Terisi' },
  { key: 'jml_materi', header: 'Materi Terisi' },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const semesterid = sp.get('semesterid');
    if (!semesterid) {
      return NextResponse.json({ error: 'Parameter semesterid wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }
    const jenisLaporan = sp.get('jenis_laporan') || 'reguler';

    const rows = await fetchRekapByKantor(semesterid, jenisLaporan, session);

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `rekap-laporan-semester-${semesterid}-${stamp}.xlsx`,
      'Rekap',
      COLUMNS,
      rows as unknown as Array<Record<string, unknown>>,
    );
  } catch (err) {
    console.error('[laporan-semester export]', err);
    return NextResponse.json({ error: 'Gagal export rekap laporan semester.' }, { status: 500 });
  }
}
