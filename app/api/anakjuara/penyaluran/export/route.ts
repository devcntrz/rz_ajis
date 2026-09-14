/** GET /api/anakjuara/penyaluran/export — xlsx of tab Wilayah, same columns as the grid. */
import { NextRequest } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchBatchList } from '@/lib/penyaluran/queries';
import { batchListQuery, searchParamsToObject } from '@/lib/penyaluran/schema';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';
import { labelBulan } from '@/lib/keuangan';

const EXPORT_LIMIT = 20_000;

const COLUMNS: ExcelColumn[] = [
  { key: 'id_penyaluran', header: 'ID Penyaluran' },
  { key: 'nama_wilayah', header: 'Wilayah' },
  { key: 'nama_kantor', header: 'Kantor' },
  { key: 'bulan', header: 'Bulan' },
  { key: 'tahun', header: 'Tahun' },
  { key: 'periode', header: 'Periode' },
  { key: 'jumlah_anak', header: 'Jml Anak' },
  { key: 'jumlah_penyaluran', header: 'Jumlah Penyaluran' },
  { key: 'jumlah_hpp', header: 'Jumlah HPP' },
  { key: 'nama_sdm', header: 'SDM' },
  { key: 'tgl_penyaluran', header: 'Tgl Penyaluran' },
  { key: 'status_akhir', header: 'Status' },
];

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const sp = searchParamsToObject(req.nextUrl.searchParams);
    const filters = batchListQuery.omit({ page: true, limit: true }).parse(sp);
    const { rows } = await fetchBatchList(
      { ...filters, page: 1, limit: EXPORT_LIMIT },
      g.session,
    );

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `penyaluran-wilayah-${stamp}.xlsx`,
      'Penyaluran',
      COLUMNS,
      rows.map(r => ({
        ...r,
        bulan: labelBulan(r.bulan),
        tgl_penyaluran: r.tgl_penyaluran ? String(r.tgl_penyaluran).slice(0, 10) : '',
        status_akhir: r.status_akhir === 'y' ? 'Terkunci' : 'Berjalan',
        nama_sdm: r.nama_sdm || '-',
      })) as unknown as Record<string, unknown>[],
    );
  } catch (err) {
    return toErrorResponse('penyaluran export', err);
  }
}
