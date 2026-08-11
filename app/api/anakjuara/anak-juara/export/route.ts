/**
 * GET /api/anakjuara/anak-juara/export
 * Excel export of Anak Juara (full columns), same filters as list (no pagination).
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import { excelDownloadResponse, type ExcelColumn } from '@/lib/excel';

const COLUMNS: ExcelColumn[] = [
  { key: 'id_pemasangan_baru', header: 'ID Pemasangan' },
  { key: 'tahun', header: 'Tahun' },
  { key: 'id_anak', header: 'ID Anak' },
  { key: 'nama_anak', header: 'Nama Anak' },
  { key: 'jns_kel', header: 'JK' },
  { key: 'nik', header: 'NIK' },
  { key: 'jenjang_pendidikan', header: 'Jenjang' },
  { key: 'kelas', header: 'Kelas' },
  { key: 'asnaf', header: 'Asnaf' },
  { key: 'status_ortu', header: 'Status Ortu' },
  { key: 'id_donatur', header: 'ID Donatur' },
  { key: 'nama_donatur', header: 'Nama Donatur' },
  { key: 'program_donasi', header: 'Program Donasi' },
  { key: 'id_program', header: 'ID Program' },
  { key: 'nia_rfo', header: 'NIA RFO' },
  { key: 'nama_rfo', header: 'Nama RFO' },
  { key: 'id_kantor', header: 'ID Kantor' },
  { key: 'nama_kantor', header: 'Nama Kantor' },
  { key: 'id_wilayah_pembinaan', header: 'ID Wilayah' },
  { key: 'nama_wilayah', header: 'Nama Wilayah' },
  { key: 'status_pasangan', header: 'Status Pasangan' },
  { key: 'tgl_pemasangan', header: 'Tgl Pemasangan' },
  { key: 'tgl_pemberhentian_pemasangan', header: 'Tgl Pemberhentian' },
  { key: 'keterangan_pemberhentian', header: 'Ket. Pemberhentian' },
  { key: 'via_input', header: 'Via Input' },
  { key: 'user_insert', header: 'User Insert' },
  { key: 'via_stop', header: 'Via Stop' },
  { key: 'user_stop', header: 'User Stop' },
  { key: 'no_rekening', header: 'No Rekening' },
  { key: 'tunda_penyaluran', header: 'Tunda Penyaluran' },
  { key: 'jcustid', header: 'JCustID' },
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
    const currentYear = String(new Date().getFullYear());
    const tahun = sp.get('tahun') || currentYear;
    const wilayah = sp.get('wilayah') || '';
    const statusPasangan = sp.get('status_pasangan') || '';
    const q = sp.get('q') || '';

    const { sql: scopeSql, params: scopeParams, forcedKantor } = getKantorScope(
      session,
      'kantor_id',
      'p',
    );

    const conditions: string[] = [scopeSql, 'p.tahun = ?'];
    const params: unknown[] = [...scopeParams, tahun];

    const kantorParam = sp.get('kantor_id') || '';
    if (!forcedKantor && kantorParam) {
      conditions.push('p.kantor_id = ?');
      params.push(kantorParam);
    }
    if (wilayah) {
      conditions.push('p.id_wilayah_pembinaan = ?');
      params.push(wilayah);
    }
    if (statusPasangan === 'y' || statusPasangan === 'n') {
      conditions.push('p.status_pasangan = ?');
      params.push(statusPasangan);
    }
    if (q) {
      conditions.push(`(
        p.nama_anak LIKE ? OR p.id_anak LIKE ? OR
        p.nama_donatur LIKE ? OR p.id_donatur LIKE ? OR
        p.nama_kantor LIKE ? OR p.nama_wilayah LIKE ? OR
        p.nia_rfo LIKE ? OR p.nama_rfo LIKE ? OR
        p.id_pemasangan_baru LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like, like, like);
    }

    const WHERE = conditions.join(' AND ');

    const rows = await query<Record<string, unknown>>(
      `SELECT
         p.id_pemasangan_baru,
         p.tahun,
         p.id_anak,
         p.nama_anak,
         p.id_donatur,
         p.nama_donatur,
         p.program_donasi,
         p.id_program,
         p.kantor_id AS id_kantor,
         p.nama_kantor,
         p.id_wilayah_pembinaan,
         p.nama_wilayah,
         p.status_pasangan,
         p.tgl_pemasangan,
         p.tgl_pemberhentian_pemasangan,
         p.keterangan_pemberhentian,
         p.via_input,
         p.user_insert,
         p.via_stop,
         p.user_stop,
         p.no_rekening,
         p.tunda_penyaluran,
         p.nia_rfo,
         p.nama_rfo,
         p.jns_kel,
         p.jenjang_pendidikan,
         p.asnaf,
         p.status_ortu,
         p.kelas,
         p.nik,
         p.jcustid
       FROM ajis_pemasangan p
       WHERE ${WHERE}
       ORDER BY p.nama_anak ASC
       LIMIT ?`,
      [...params, EXPORT_LIMIT],
    );

    const stamp = new Date().toISOString().slice(0, 10);
    return excelDownloadResponse(
      `anak-juara-${tahun}-${stamp}.xlsx`,
      'Anak Juara',
      COLUMNS,
      rows,
    );
  } catch (err) {
    console.error('[anak-juara export]', err);
    return NextResponse.json({ error: 'Gagal export Anak Juara.' }, { status: 500 });
  }
}
