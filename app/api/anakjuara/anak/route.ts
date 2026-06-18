/**
 * GET /api/anakjuara/anak — List children (paginated, filtered)
 * Scoped to user's wilayah/kantor based on role.
 * source=anak (default): ajis_anak
 * source=pemasangan: ajis_pemasangan JOIN ajis_anak where status_pasangan='y'
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';

const SELECT_COLUMNS = `
  a.id_anak, a.nama_lengkap, a.nama_panggilan, a.jns_kel,
  a.jenjang_pendidikan, a.kelas, a.nama_sekolah,
  a.asnaf, a.status_ortu, a.id_wilayah_pembinaan,
  a.nama_wilayah, a.nama_kantor,
  a.tgl_lahir, a.tgl_terdaftar, a.foto,
  a.telp_yang_bisa_dihubungi`;

type AnakListRow = {
  id_anak: string; nama_lengkap: string; nama_panggilan: string;
  jns_kel: string; jenjang_pendidikan: string; kelas: string;
  nama_sekolah: string; asnaf: string; status_ortu: string;
  id_wilayah_pembinaan: number; nama_wilayah: string; nama_kantor: string;
  tgl_lahir: string; tgl_terdaftar: string; foto: string;
  telp_yang_bisa_dihubungi: string;
};

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
    const idSdm      = sp.get('id_sdm')     || '';
    const source     = sp.get('source') === 'pemasangan' ? 'pemasangan' : 'anak';
    const page       = Math.max(1, parseInt(sp.get('page')  || '1'));
    const limit      = Math.min(500, parseInt(sp.get('limit') || '10'));
    const offset     = (page - 1) * limit;

    if (source === 'pemasangan') {
      const { sql: scope, params: scopeParams } = getScopeCondition(session, 'p');
      const pemConditions: string[] = [scope, `p.status_pasangan = 'y'`];
      const pemParams: unknown[] = [...scopeParams];

      const pemSubquery = `
        SELECT DISTINCT p.id_anak
        FROM ajis_pemasangan p
        WHERE ${pemConditions.join(' AND ')}`;

      const conditions: string[] = [`a.aktif = 'y'`];
      const qparams: unknown[] = [...pemParams];

      if (q) {
        conditions.push(`(a.nama_lengkap LIKE ? OR a.nama_panggilan LIKE ? OR a.id_anak LIKE ?)`);
        const like = `%${q}%`;
        qparams.push(like, like, like);
      }
      if (status) { conditions.push('a.status_ortu LIKE ?'); qparams.push(`%${status}%`); }
      if (jenjang) { conditions.push('a.jenjang_pendidikan = ?'); qparams.push(jenjang); }
      if (asnaf)   { conditions.push('a.asnaf = ?'); qparams.push(asnaf); }
      if (wilayah) { conditions.push('a.id_wilayah_pembinaan = ?'); qparams.push(wilayah); }
      if (idSdm)   { conditions.push('a.id_sdm = ?'); qparams.push(idSdm); }

      const WHERE = conditions.join(' AND ');

      const [countRow] = await query<{ total: number }>(
        `SELECT COUNT(*) AS total
         FROM ajis_anak a
         INNER JOIN (${pemSubquery}) pem ON pem.id_anak = a.id_anak
         WHERE ${WHERE}`,
        qparams,
      );

      const rows = await query<AnakListRow>(
        `SELECT ${SELECT_COLUMNS}
         FROM ajis_anak a
         INNER JOIN (${pemSubquery}) pem ON pem.id_anak = a.id_anak
         WHERE ${WHERE}
         ORDER BY a.nama_lengkap
         LIMIT ? OFFSET ?`,
        [...qparams, limit, offset],
      );

      return NextResponse.json({ data: rows, total: countRow?.total ?? 0, page, limit });
    }

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
    if (idSdm)   { conditions.push('a.id_sdm = ?'); qparams.push(idSdm); }

    const WHERE = conditions.join(' AND ');

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ajis_anak a WHERE ${WHERE}`,
      qparams,
    );

    const rows = await query<AnakListRow>(
      `SELECT ${SELECT_COLUMNS}
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
