/**
 * GET /api/anakjuara/calon-anak-juara — CAJ list (MySQL ajis_anak).
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';
import type { CalonAnakJuaraRow } from '@/types/calon-anak-juara';

const SELECT_COLUMNS = `
  a.id_anak, a.nama_lengkap, a.jns_kel, a.kelas, a.status_ortu,
  a.jenjang_pendidikan, a.foto, a.tgl_peminjaman, a.nia_rfo_book,
  a.nama_rfo_book, a.book_via, a.user_book, a.tgl_terdaftar,
  a.nama_kantor, a.nama_wilayah, a.alamat, a.kantor_id, a.id_wilayah_pembinaan,
  IF(a.nia_rfo_book IS NOT NULL AND a.nia_rfo_book != '', 'y', 'n') AS status_pinjam`;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const q = (sp.get('q') || '').trim();
    const kantorId = session.idGroupUser === 1 ? (sp.get('kantor_id') || '') : '';
    const wilayah = sp.get('wilayah') || '';
    const kelas = (sp.get('kelas') || '').trim();
    const jenjang = (sp.get('jenjang') || '').trim();
    const statusOrtu = (sp.get('status_ortu') || '').trim();
    const booked = sp.get('booked') || '';
    const bookVia = (sp.get('book_via') || '').trim();
    const tglFrom = sp.get('tgl_terdaftar_from') || '';
    const tglTo = sp.get('tgl_terdaftar_to') || '';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '10', 10)));
    const offset = (page - 1) * limit;

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');
    const conditions: string[] = [scope, `a.status_anak_juara = 'caj'`];
    const params: unknown[] = [...scopeParams];

    if (q) {
      conditions.push(
        `(a.nama_lengkap LIKE ? OR a.id_anak LIKE ? OR a.nia_rfo_book LIKE ? OR a.nama_rfo_book LIKE ?)`,
      );
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    if (kantorId) {
      conditions.push('a.kantor_id = ?');
      params.push(kantorId);
    }
    if (wilayah) {
      conditions.push('a.id_wilayah_pembinaan = ?');
      params.push(wilayah);
    }
    if (kelas) {
      conditions.push('a.kelas = ?');
      params.push(kelas);
    }
    if (jenjang) {
      conditions.push('LOWER(a.jenjang_pendidikan) = LOWER(?)');
      params.push(jenjang);
    }
    if (statusOrtu) {
      conditions.push('a.status_ortu = ?');
      params.push(statusOrtu);
    }
    if (booked === 'y') {
      conditions.push(`a.nia_rfo_book IS NOT NULL AND a.nia_rfo_book != ''`);
    } else if (booked === 'n') {
      conditions.push(`(a.nia_rfo_book IS NULL OR a.nia_rfo_book = '')`);
    }
    if (bookVia) {
      conditions.push('a.book_via = ?');
      params.push(bookVia);
    }
    if (tglFrom) {
      conditions.push('a.tgl_terdaftar >= ?');
      params.push(tglFrom);
    }
    if (tglTo) {
      conditions.push('a.tgl_terdaftar <= ?');
      params.push(tglTo);
    }

    const WHERE = conditions.join(' AND ');

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_anak a WHERE ${WHERE}`,
      params,
    );

    const rows = await query<CalonAnakJuaraRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM ajis_anak a
       WHERE ${WHERE}
       ORDER BY a.tgl_terdaftar DESC, a.nama_lengkap ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      data: rows,
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    });
  } catch (err) {
    console.error('[calon-anak-juara list]', err);
    return NextResponse.json({ error: 'Gagal memuat Calon Anak Juara.' }, { status: 500 });
  }
}
