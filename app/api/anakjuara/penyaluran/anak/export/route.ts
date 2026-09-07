/** GET /api/anakjuara/penyaluran/anak/export — xlsx grid tab Anak. */
import { NextRequest } from 'next/server';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { fetchAnakList } from '@/lib/penyaluran/queries';
import { anakListQuery, searchParamsToObject } from '@/lib/penyaluran/schema';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';

const COLUMNS: ExcelColumn[] = [
  { key: 'id_penyaluran', header: 'ID Penyaluran' },
  { key: 'id_row', header: 'ID Row' },
  { key: 'id_anak', header: 'ID Anak' },
  { key: 'nama_anak', header: 'Nama Anak' },
  { key: 'nik', header: 'NIK' },
  { key: 'jenjang_pendidikan', header: 'Jenjang' },
  { key: 'kelas', header: 'Kelas' },
  { key: 'nama_donatur', header: 'Donatur' },
  { key: 'nama_kantor', header: 'Kantor' },
  { key: 'nama_wilayah', header: 'Wilayah' },
  { key: 'program_donasi', header: 'Program' },
  { key: 'nominal_penyaluran', header: 'Nominal Penyaluran' },
  { key: 'nominal_hpp', header: 'Nominal HPP' },
  { key: 'bulan', header: 'Bulan' },
  { key: 'tahun', header: 'Tahun' },
  { key: 'periode', header: 'Periode' },
  { key: 'via_input', header: 'Via Input' },
  { key: 'no_rekening', header: 'No Rekening' },
  { key: 'nama_bank', header: 'Bank' },
  { key: 'pemilik_rekening', header: 'Pemilik Rekening' },
];

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const sp = searchParamsToObject(req.nextUrl.searchParams);
    const parsed = anakListQuery.parse({ ...sp, page: '1', limit: '20000' });
    const { rows } = await fetchAnakList(parsed, g.session);

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `penyaluran-anak-${stamp}.xlsx`, 'Penyaluran Anak', COLUMNS,
      rows as unknown as Record<string, unknown>[],
    );
  } catch (err) {
    return toErrorResponse('penyaluran anak export', err);
  }
}
