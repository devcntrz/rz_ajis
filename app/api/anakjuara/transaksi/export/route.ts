/**
 * GET /api/anakjuara/transaksi/export?scope=main|review|cicilan|unidentified
 * Excel export of the Transaksi grid, one route serving all four tabs — same filters,
 * same fixed WHERE base and role scope as GET /api/anakjuara/transaksi (see
 * lib/transaksi/queries.ts), just without pagination.
 */
import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { guard, toErrorResponse } from '@/lib/transaksi/api';
import { buildListWhere, TRANSAKSI_COLUMNS } from '@/lib/transaksi/queries';
import { listQuery, searchParamsToObject } from '@/lib/transaksi/schema';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';
import { fmtTgl } from '@/lib/utils';
import type { Transaksi } from '@/types/transaksi';

// `main` alone can hold 200k+ rows; building the xlsx can exceed the default timeout.
export const maxDuration = 60;

const EXPORT_LIMIT = 20_000;

/** Mirrors components/transaksi/TransaksiTable.tsx column-for-column (minus the
 *  non-data '#'/checkbox and 'Aksi' columns). */
const COLUMNS: ExcelColumn[] = [
  { key: 'nama_donatur', header: 'Donatur' },
  { key: 'did', header: 'ID Donatur' },
  { key: 'transid', header: 'Trans ID' },
  { key: 'detailid', header: 'Detail ID' },
  { key: 'nama_program', header: 'Program' },
  { key: 'perkiraan_rp', header: 'Nominal' },
  { key: 'total_input_donasi', header: 'Terinput' },
  { key: 'selisih_donasi', header: 'Selisih' },
  { key: 'status_pasang_label', header: 'Entry' },
  { key: 'approve_salur_label', header: 'Approve' },
  { key: 'bulan_salur', header: 'Bulan Salur' },
  { key: 'tahun_salur', header: 'Tahun Salur' },
  { key: 'tgl_transaksi', header: 'Tgl Transaksi' },
  { key: 'tgl_donasi', header: 'Tgl Donasi' },
  { key: 'kantor_donatur', header: 'Kantor Donatur' },
  { key: 'jml_anak_ijis', header: 'Anak IJIS' },
  { key: 'kantor_ijis', header: 'Kantor IJIS' },
  { key: 'jml_mustahik', header: 'Jml PM' },
];

export async function GET(req: NextRequest) {
  try {
    const g = await guard();
    if (!g.ok) return g.response;

    const parsed = listQuery.parse(searchParamsToObject(req.nextUrl.searchParams));
    const { sql: WHERE, params } = buildListWhere(parsed, g.session);

    const rows = await query<Transaksi>(
      `SELECT ${TRANSAKSI_COLUMNS}
       FROM transaksi a
       WHERE ${WHERE}
       ORDER BY a.tgl_transaksi DESC, a.transid DESC, a.detailid ASC
       LIMIT ?`,
      [...params, EXPORT_LIMIT],
    );

    const exportRows = rows.map(r => ({
      nama_donatur: r.nama_donatur || '-',
      did: r.did || '-',
      transid: r.transid,
      detailid: r.detailid,
      nama_program: r.nama_program || '-',
      perkiraan_rp: r.perkiraan_rp,
      total_input_donasi: r.total_input_donasi,
      selisih_donasi: r.selisih_donasi,
      status_pasang_label: r.status_pasang === 'y' ? 'Sudah' : 'Belum',
      approve_salur_label: r.approve_salur === 'y' ? 'Ya' : r.approve_salur === 'n' ? 'Tidak' : '-',
      bulan_salur: r.bulan_salur || '-',
      tahun_salur: r.tahun_salur || '-',
      tgl_transaksi: fmtTgl(r.tgl_transaksi),
      tgl_donasi: fmtTgl(r.tgl_donasi),
      kantor_donatur: r.kantor_donatur || '-',
      jml_anak_ijis: r.jml_anak_ijis ?? 0,
      kantor_ijis: r.kantor_ijis || '-',
      jml_mustahik: r.jml_mustahik || '-',
    }));

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `transaksi-${parsed.scope}-${stamp}.xlsx`,
      'Transaksi',
      COLUMNS,
      exportRows,
    );
  } catch (err) {
    return toErrorResponse('export', err);
  }
}
