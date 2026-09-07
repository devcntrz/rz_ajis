/** GET /api/anakjuara/penyaluran/{id}/export — xlsx detail satu batch. */

import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchBatchDetail } from '@/lib/penyaluran/queries';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';

const COLUMNS: ExcelColumn[] = [
  { key: 'id_row', header: 'ID Row' },
  { key: 'id_anak', header: 'ID Anak' },
  { key: 'nama_anak', header: 'Nama Anak' },
  { key: 'nik', header: 'NIK' },
  { key: 'jenjang_pendidikan', header: 'Jenjang' },
  { key: 'kelas', header: 'Kelas' },
  { key: 'nama_donatur', header: 'Donatur' },
  { key: 'program_donasi', header: 'Program' },
  { key: 'nominal_penyaluran', header: 'Nominal Penyaluran' },
  { key: 'nominal_hpp', header: 'Nominal HPP' },
  { key: 'no_rekening', header: 'No Rekening' },
  { key: 'nama_bank', header: 'Bank' },
  { key: 'pemilik_rekening', header: 'Pemilik Rekening' },
];

export async function GET(_req: Request, { params }: { params: Promise<{ idPenyaluran: string }> }) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const { idPenyaluran } = await params;
    const rows = await fetchBatchDetail(idPenyaluran, g.session);

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `penyaluran-detail-${idPenyaluran}-${stamp}.xlsx`, 'Detail Penyaluran', COLUMNS,
      rows as unknown as Record<string, unknown>[],
    );
  } catch (err) {
    return toErrorResponse('penyaluran detail export', err);
  }
}
