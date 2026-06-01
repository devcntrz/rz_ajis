/**
 * GET /api/anakjuara/penilaian
 * Returns list of children with their evaluation status for a given semester.
 * Query parameters: semester, wilayah, q, status (has_data | no_data)
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp       = req.nextUrl.searchParams;
    const semester = sp.get('semester') || '25';
    const wilayah  = sp.get('wilayah')  || '';
    const q        = sp.get('q')        || '';
    const status   = sp.get('status')   || ''; // 'has_data' | 'no_data'

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');
    const conditions = [scope, "a.aktif = 'y'"];
    const qparams: unknown[] = [...scopeParams];

    if (wilayah) {
      conditions.push('a.id_wilayah_pembinaan = ?');
      qparams.push(wilayah);
    }
    if (q) {
      conditions.push('(a.nama_lengkap LIKE ? OR a.id_anak LIKE ?)');
      const like = `%${q}%`;
      qparams.push(like, like);
    }

    const WHERE = conditions.join(' AND ');

    // Check if pivot mode is requested
    const pivot = sp.get('pivot') === 'true';

    if (pivot) {
      // Fetch children list
      const children = await query<{
        id_anak: string; nama_lengkap: string; jenjang_pendidikan: string; nama_wilayah: string;
      }>(
        `SELECT a.id_anak, a.nama_lengkap, a.jenjang_pendidikan, a.nama_wilayah
         FROM ajis_anak a WHERE ${WHERE} ORDER BY a.nama_lengkap`,
        qparams,
      );

      // Fetch all penilaian rows for this semester
      const allPenilaian = await query<{
        id_anak: string; aspek: string; hasil_akhir: string;
      }>(
        `SELECT id_anak, aspek, hasil_akhir
         FROM ajis_penilaian
         WHERE semesterid = ?`,
        [semester],
      );

      // Map assessments by child
      const evalMap: Record<string, Record<string, string>> = {};
      allPenilaian.forEach(row => {
        if (!evalMap[row.id_anak]) evalMap[row.id_anak] = {};
        evalMap[row.id_anak][row.aspek] = row.hasil_akhir;
      });

      const pivotedData = children.map(c => ({
        id_anak:            c.id_anak,
        nama_lengkap:       c.nama_lengkap,
        jenjang_pendidikan: c.jenjang_pendidikan,
        nama_wilayah:       c.nama_wilayah,
        aspects:            evalMap[c.id_anak] || {},
      }));

      return NextResponse.json({ data: pivotedData });
    }

    // Fetch children and aggregate aspect count for this semester
    const rows = await query<{
      id_anak: string;
      nama_lengkap: string;
      jenjang_pendidikan: string;
      nama_wilayah: string;
      nama_kantor: string;
      record_count: number;
      nilai_capaian_avg: number;
    }>(
      `SELECT a.id_anak, a.nama_lengkap, a.jenjang_pendidikan, a.nama_wilayah, a.nama_kantor,
              COUNT(p.aspek) AS record_count,
              AVG(CASE WHEN p.nilai_capaian > 0 THEN p.nilai_capaian ELSE NULL END) AS nilai_capaian_avg
       FROM   ajis_anak a
       LEFT JOIN ajis_penilaian p ON p.id_anak = a.id_anak AND p.semesterid = ?
       WHERE  ${WHERE}
       GROUP BY a.id_anak
       ORDER BY a.nama_lengkap`,
      [semester, ...qparams],
    );

    // Filter by status if specified
    let filtered = rows;
    if (status === 'has_data') {
      filtered = rows.filter(r => r.record_count > 0);
    } else if (status === 'no_data') {
      filtered = rows.filter(r => r.record_count === 0);
    }

    return NextResponse.json({ data: filtered });
  } catch (err) {
    console.error('[penilaian list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar penilaian.' }, { status: 500 });
  }
}
