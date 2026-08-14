/**
 * GET /api/anakjuara/anak-juara
 * Fast Anak Juara list from ajis_pemasangan (no heavy view / donation pivot).
 * Access: id_group_user 1 | 2 only. Group 2 forced to session.idKantor.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';
import type { AnakJuaraRow } from '@/types/anak-juara';

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
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    const SORT_MAP: Record<string, string> = {
      nama_anak:        'p.nama_anak',
      id_anak:          'p.id_anak',
      status_pasangan:  'p.status_pasangan',
      nama_donatur:     'p.nama_donatur',
      program_donasi:   'p.program_donasi',
      nama_rfo:         'p.nama_rfo',
      nama_kantor:      'p.nama_kantor',
      nama_wilayah:     'p.nama_wilayah',
      tgl_pemasangan:   'p.tgl_pemasangan',
    };
    const sortByRaw = sp.get('sort') || 'nama_anak';
    const sortCol = SORT_MAP[sortByRaw] || SORT_MAP.nama_anak;
    const sortDir = sp.get('order') === 'desc' ? 'DESC' : 'ASC';
    const sortBy = SORT_MAP[sortByRaw] ? sortByRaw : 'nama_anak';
    const order = sortDir === 'DESC' ? 'desc' : 'asc';

    const { sql: scopeSql, params: scopeParams, forcedKantor } = getKantorScope(
      session,
      'kantor_id',
      'p',
    );

    const conditions: string[] = [scopeSql, 'p.tahun = ?'];
    const params: unknown[] = [...scopeParams, tahun];

    // Group 1 may optionally filter by kantor; group 2 already forced
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

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_pemasangan p WHERE ${WHERE}`,
      params,
    );

    const rows = await query<AnakJuaraRow>(
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
       ORDER BY ${sortCol} ${sortDir}, p.id_pemasangan_baru ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows,
      total: countRow?.total ?? 0,
      page,
      limit,
      sort: sortBy,
      order,
    });
  } catch (err) {
    console.error('[anak-juara list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar Anak Juara.' }, { status: 500 });
  }
}
