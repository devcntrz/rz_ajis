/** GET /api/anakjuara/peminjaman/export — Excel export of Peminjaman Anak, same filters as list. */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';

const COLUMNS: ExcelColumn[] = [
  { key: 'id_peminjaman', header: 'ID Peminjaman' },
  { key: 'id_anak', header: 'ID Anak' },
  { key: 'nama_anak', header: 'Nama Anak' },
  { key: 'tipe_peminjam', header: 'Tipe Peminjam' },
  { key: 'id_peminjam', header: 'ID Peminjam' },
  { key: 'nama_peminjam', header: 'Nama Peminjam' },
  { key: 'nama_kantor', header: 'Kantor' },
  { key: 'nama_wilayah', header: 'Wilayah' },
  { key: 'tgl_awal_peminjaman', header: 'Tgl Awal' },
  { key: 'tgl_expired', header: 'Tgl Expired' },
  { key: 'tgl_selesai_peminjaman', header: 'Tgl Selesai' },
  { key: 'status_pinjam', header: 'Status Pinjam' },
  { key: 'cancel', header: 'Dibatalkan' },
  { key: 'alasan_cancel', header: 'Alasan Batal' },
];

const EXPORT_LIMIT = 20_000;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const q = (sp.get('q') || '').trim();
    const status = sp.get('status') || '';
    const tipePeminjam = sp.get('tipe_peminjam') || '';
    const kantorId = session.idGroupUser === 1 ? (sp.get('kantor_id') || '') : '';
    const wilayah = sp.get('wilayah') || '';
    const tglFrom = sp.get('tgl_awal_from') || '';
    const tglTo = sp.get('tgl_awal_to') || '';

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'p');
    const conditions: string[] = [scope];
    const params: unknown[] = [...scopeParams];

    if (q) {
      conditions.push('(p.nama_anak LIKE ? OR p.id_anak LIKE ? OR p.nama_peminjam LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (status === 'aktif') conditions.push(`p.status_pinjam = 'y' AND p.cancel != 'y'`);
    if (status === 'selesai') conditions.push(`p.tgl_selesai_peminjaman IS NOT NULL AND p.cancel != 'y'`);
    if (status === 'cancel') conditions.push(`p.cancel = 'y'`);
    if (tipePeminjam === 'donatur') conditions.push('d.id_peminjam IS NOT NULL');
    if (tipePeminjam === 'karyawan') conditions.push('d.id_peminjam IS NULL');
    if (kantorId) { conditions.push('p.kantor_id = ?'); params.push(kantorId); }
    if (wilayah) { conditions.push('p.id_wilayah_pembinaan = ?'); params.push(wilayah); }
    if (tglFrom) { conditions.push('p.tgl_awal_peminjaman >= ?'); params.push(tglFrom); }
    if (tglTo) { conditions.push('p.tgl_awal_peminjaman <= ?'); params.push(tglTo); }

    const WHERE = conditions.join(' AND ');

    const rows = await query<Record<string, unknown>>(
      `SELECT p.id_peminjaman, p.id_anak, p.nama_anak,
              IF(d.id_peminjam IS NOT NULL, 'donatur', 'karyawan') AS tipe_peminjam,
              p.id_peminjam, p.nama_peminjam, p.nama_kantor, p.nama_wilayah,
              p.tgl_awal_peminjaman, p.tgl_expired, p.tgl_selesai_peminjaman,
              p.status_pinjam, p.cancel, p.alasan_cancel
       FROM ajis_peminjaman_anak p
       LEFT JOIN ajis_peminjam d ON d.id_peminjam = p.id_peminjam
       WHERE ${WHERE}
       ORDER BY p.id_peminjaman DESC
       LIMIT ?`,
      [...params, EXPORT_LIMIT],
    );

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(`peminjaman-anak-${stamp}.xlsx`, 'Peminjaman Anak', COLUMNS, rows);
  } catch (err) {
    console.error('[peminjaman export]', err);
    return NextResponse.json({ error: 'Gagal export peminjaman.' }, { status: 500 });
  }
}
