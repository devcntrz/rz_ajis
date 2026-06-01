/**
 * GET /api/anakjuara/anak — List children (paginated, filtered)
 * Scoped to user's wilayah/kantor based on role.
 * Real table: ajis_anak
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const q          = sp.get('q')          || '';
    const status     = sp.get('status_ortu')|| '';
    const jenjang    = sp.get('jenjang')    || '';
    const asnaf      = sp.get('asnaf')      || '';
    const wilayah    = sp.get('wilayah')    || '';
    const page       = Math.max(1, parseInt(sp.get('page')  || '1'));
    const limit      = Math.min(100, parseInt(sp.get('limit') || '50'));
    const offset     = (page - 1) * limit;

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');

    const conditions: string[]  = [scope, `a.aktif = 'y'`];
    const qparams: unknown[]    = [...scopeParams];

    if (q) {
      conditions.push(`(a.nama_lengkap LIKE ? OR a.nama_panggilan LIKE ? OR a.id_anak LIKE ?)`);
      const like = `%${q}%`;
      qparams.push(like, like, like);
    }
    if (status) { conditions.push('a.status_ortu LIKE ?'); qparams.push(`%${status}%`); }
    if (jenjang) { conditions.push('a.jenjang_pendidikan = ?'); qparams.push(jenjang); }
    if (asnaf)   { conditions.push('a.asnaf = ?');   qparams.push(asnaf); }
    if (wilayah) { conditions.push('a.id_wilayah_pembinaan = ?'); qparams.push(wilayah); }

    const WHERE = conditions.join(' AND ');

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_anak a WHERE ${WHERE}`,
      qparams,
    );

    const rows = await query<{
      id_anak: string; nama_lengkap: string; nama_panggilan: string;
      jns_kel: string; jenjang_pendidikan: string; kelas: string;
      nama_sekolah: string; asnaf: string; status_ortu: string;
      id_wilayah_pembinaan: number; nama_wilayah: string; nama_kantor: string;
      tgl_lahir: string; tgl_terdaftar: string; foto: string;
      telp_yang_bisa_dihubungi: string;
    }>(
      `SELECT a.id_anak, a.nama_lengkap, a.nama_panggilan, a.jns_kel,
              a.jenjang_pendidikan, a.kelas, a.nama_sekolah,
              a.asnaf, a.status_ortu, a.id_wilayah_pembinaan,
              a.nama_wilayah, a.nama_kantor,
              a.tgl_lahir, a.tgl_terdaftar, a.foto,
              a.telp_yang_bisa_dihubungi
       FROM   ajis_anak a
       WHERE  ${WHERE}
       ORDER  BY a.nama_lengkap
       LIMIT  ? OFFSET ?`,
      [...qparams, limit, offset],
    );

    return NextResponse.json({ data: rows, total: countRow?.total ?? 0, page, limit });
  } catch (err) {
    console.error('[anak list]', err);
    return NextResponse.json({ error: 'Gagal memuat data anak.' }, { status: 500 });
  }
}
