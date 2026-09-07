/** GET /api/anakjuara/penyaluran/export — xlsx grid batch (tab Wilayah). */
import { NextRequest } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchBatchList } from '@/lib/penyaluran/queries';
import { batchListQuery, searchParamsToObject } from '@/lib/penyaluran/schema';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';

const COLUMNS: ExcelColumn[] = [
  { key: 'id_penyaluran', header: 'ID Penyaluran' },
  { key: 'nama_kantor', header: 'Kantor' },
  { key: 'nama_wilayah', header: 'Wilayah' },
  { key: 'bulan', header: 'Bulan' },
  { key: 'tahun', header: 'Tahun' },
  { key: 'periode', header: 'Periode' },
  { key: 'status_akhir', header: 'Status Akhir' },
  { key: 'tgl_penyaluran', header: 'Tgl Penyaluran' },
  { key: 'nama_sdm', header: 'SDM' },
  { key: 'jumlah_anak', header: 'Jumlah Anak' },
  { key: 'jumlah_penyaluran', header: 'Jumlah Penyaluran' },
  { key: 'jumlah_hpp', header: 'Jumlah HPP' },
  { key: 'jumlah_sd', header: 'SD' },
  { key: 'jumlah_smp', header: 'SMP' },
  { key: 'jumlah_sma', header: 'SMA' },
  { key: 'jumlah_pt', header: 'Mahasiswa' },
];

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const sp = searchParamsToObject(req.nextUrl.searchParams);
    const parsed = batchListQuery.parse({ ...sp, page: '1', limit: '20000' });
    const { rows } = await fetchBatchList(parsed, g.session);

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `penyaluran-wilayah-${stamp}.xlsx`, 'Penyaluran', COLUMNS,
      rows as unknown as Record<string, unknown>[],
    );
  } catch (err) {
    return toErrorResponse('penyaluran export', err);
  }
}
