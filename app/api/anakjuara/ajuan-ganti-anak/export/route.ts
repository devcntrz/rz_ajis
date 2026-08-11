/**
 * GET /api/anakjuara/ajuan-ganti-anak/export
 * Excel export of List Ajuan Pergantian (full columns), same filters as list.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';

const COLUMNS: ExcelColumn[] = [
  { key: 'id_ajuan', header: 'ID Ajuan' },
  { key: 'tgl_ajuan', header: 'Tgl Ajuan' },
  { key: 'tgl_approve_funding', header: 'Tgl Approve Funding' },
  { key: 'tgl_eksekusi', header: 'Tgl Eksekusi' },
  { key: 'approve_funding', header: 'Approve Funding' },
  { key: 'status_eksekusi', header: 'Status Eksekusi' },
  { key: 'id_kantor', header: 'ID Kantor' },
  { key: 'nama_kantor', header: 'Nama Kantor' },
  { key: 'id_wilayah_pembinaan', header: 'ID Wilayah' },
  { key: 'nama_wilayah', header: 'Nama Wilayah' },
  { key: 'id_donatur', header: 'ID Donatur' },
  { key: 'oid_donatur', header: 'OID Donatur' },
  { key: 'kantor_donatur', header: 'Kantor Donatur' },
  { key: 'nama_donatur', header: 'Nama Donatur' },
  { key: 'jenis_kelamin_donatur', header: 'JK Donatur' },
  { key: 'jenis_donatur', header: 'Jenis Donatur' },
  { key: 'hp', header: 'HP' },
  { key: 'jcustid', header: 'JCustID' },
  { key: 'program_donasi', header: 'Program Donasi' },
  { key: 'nia_rfo', header: 'NIA RFO' },
  { key: 'nama_rfo', header: 'Nama RFO' },
  { key: 'id_anak', header: 'ID Anak Asal' },
  { key: 'nama_anak_asal', header: 'Nama Anak Asal' },
  { key: 'jns_kelamin', header: 'JK Anak' },
  { key: 'alasan_pergantian', header: 'Alasan Pergantian' },
  { key: 'id_anak_pengganti', header: 'ID Anak Pengganti' },
  { key: 'nama_anak_pengganti', header: 'Nama Anak Pengganti' },
  { key: 'tipe_ganti', header: 'Tipe Ganti' },
  { key: 'keterangan', header: 'Keterangan' },
  { key: 'pindah_saldo', header: 'Pindah Saldo' },
  { key: 'alasan_reject', header: 'Alasan Reject' },
  { key: 'id_pemasangan_baru', header: 'ID Pemasangan' },
];

const EXPORT_LIMIT = 20_000;

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

    const sp = req.nextUrl.searchParams;
    const bulan = sp.get('bulan') || '';
    const tahun = sp.get('tahun') || '';
    const approve = sp.get('approve_funding') || '';
    const eksekusi = sp.get('status_eksekusi') || '';
    const q = sp.get('q') || '';

    const { sql: scopeSql, params: scopeParams, forcedKantor } = getKantorScope(
      session,
      'id_kantor',
      'a',
    );

    const conditions: string[] = [scopeSql];
    const params: unknown[] = [...scopeParams];

    const kantorParam = sp.get('kantor_id') || '';
    if (!forcedKantor && kantorParam) {
      conditions.push('a.id_kantor = ?');
      params.push(kantorParam);
    }
    if (bulan) {
      conditions.push('MONTH(a.tgl_ajuan) = ?');
      params.push(Number(bulan));
    }
    if (tahun) {
      conditions.push('YEAR(a.tgl_ajuan) = ?');
      params.push(Number(tahun));
    }
    if (approve === 't' || approve === 'y' || approve === 'n') {
      conditions.push('a.approve_funding = ?');
      params.push(approve);
    }
    if (eksekusi === 'y' || eksekusi === 'n') {
      if (eksekusi === 'n') {
        conditions.push(`(a.status_eksekusi = 'n' OR a.status_eksekusi = '' OR a.status_eksekusi IS NULL)`);
      } else {
        conditions.push('a.status_eksekusi = ?');
        params.push(eksekusi);
      }
    }
    if (q) {
      conditions.push(`(
        a.id_anak_pengganti LIKE ? OR a.id_anak LIKE ? OR
        a.nama_anak_pengganti LIKE ? OR a.nama_anak_asal LIKE ? OR
        a.id_donatur LIKE ? OR a.nama_donatur LIKE ? OR
        a.nia_rfo LIKE ? OR a.nama_rfo LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like, like);
    }

    const WHERE = conditions.join(' AND ');

    const rows = await query<Record<string, unknown>>(
      `SELECT
         a.id_ajuan, a.tgl_ajuan, a.id_pemasangan_baru,
         a.id_kantor, a.nama_kantor, a.id_wilayah_pembinaan, a.nama_wilayah,
         a.id_donatur, a.oid_donatur, a.kantor_donatur, a.nama_donatur, a.jenis_kelamin_donatur,
         a.program_donasi, a.nia_rfo, a.nama_rfo,
         a.id_anak, a.nama_anak_asal, a.jns_kelamin, a.alasan_pergantian,
         a.id_anak_pengganti, a.nama_anak_pengganti, a.keterangan, a.tipe_ganti, a.pindah_saldo,
         a.approve_funding, a.status_eksekusi, a.tgl_eksekusi, a.tgl_approve_funding,
         a.jcustid, a.jenis_donatur, a.hp, a.alasan_reject
       FROM ajis_view_ajuan a
       WHERE ${WHERE}
       ORDER BY a.tgl_ajuan DESC, a.id_ajuan DESC
       LIMIT ?`,
      [...params, EXPORT_LIMIT],
    );

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `ajuan-pergantian-${stamp}.xlsx`,
      'Ajuan Pergantian',
      COLUMNS,
      rows,
    );
  } catch (err) {
    console.error('[ajuan export]', err);
    return NextResponse.json({ error: 'Gagal export ajuan.' }, { status: 500 });
  }
}
