/**
 * GET  /api/anakjuara/pembinaan — List sessions (grouped by id_pembinaan)
 * POST /api/anakjuara/pembinaan — Create new session
 *
 * REAL SCHEMA:
 * - ajis_pembinaan_baru: one row per child per session
 * - GROUP BY id_pembinaan to get session-level summary
 * - kehadiran = 'y' (hadir) | 'n' (not)
 * - jenis_pembinaan, judul_materi, pemateri, id_wilayah_pembinaan
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, getScopeCondition } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp       = req.nextUrl.searchParams;
    const jenis    = sp.get('jenis')    || '';
    const semester = sp.get('semester') || '';
    const q        = sp.get('q')        || '';
    const tglDari  = sp.get('tgl_dari') || '';
    const tglSampai= sp.get('tgl_sampai') || '';
    const page     = Math.max(1, parseInt(sp.get('page')  || '1'));
    const limit    = Math.min(100, parseInt(sp.get('limit') || '50'));
    const offset   = (page - 1) * limit;

    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'pb');
    const conditions = [scope];
    const qparams: unknown[] = [...scopeParams];

    if (jenis)     { conditions.push('pb.jenis_pembinaan = ?');   qparams.push(jenis); }
    if (semester)  { conditions.push('pb.semesterid = ?');        qparams.push(semester); }
    if (q)         { conditions.push('pb.judul_materi LIKE ?');   qparams.push(`%${q}%`); }
    if (tglDari)   { conditions.push('pb.tgl_pembinaan >= ?');    qparams.push(tglDari); }
    if (tglSampai) { conditions.push('pb.tgl_pembinaan <= ?');    qparams.push(tglSampai); }

    const WHERE = conditions.join(' AND ');

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(DISTINCT pb.id_pembinaan) AS total
       FROM ajis_pembinaan_baru pb WHERE ${WHERE}`,
      qparams,
    );

    const rows = await query<{
      id_pembinaan: string;
      tgl_pembinaan: string;
      semesterid: string;
      jenis_pembinaan: string;
      judul_materi: string;
      pemateri: string;
      nama_wilayah: string;
      nama_kantor: string;
      id_wilayah_pembinaan: string;
      jumlah_anak: number;
      jumlah_hadir: number;
    }>(
      `SELECT pb.id_pembinaan,
              MIN(pb.tgl_pembinaan)    AS tgl_pembinaan,
              MIN(pb.semesterid)       AS semesterid,
              MIN(pb.jenis_pembinaan)  AS jenis_pembinaan,
              MIN(pb.judul_materi)     AS judul_materi,
              MIN(pb.pemateri)         AS pemateri,
              MIN(pb.nama_wilayah)     AS nama_wilayah,
              MIN(pb.nama_kantor)      AS nama_kantor,
              MIN(pb.id_wilayah_pembinaan) AS id_wilayah_pembinaan,
              COUNT(*)                 AS jumlah_anak,
              SUM(CASE WHEN pb.kehadiran='y' THEN 1 ELSE 0 END) AS jumlah_hadir
       FROM   ajis_pembinaan_baru pb
       WHERE  ${WHERE}
       GROUP  BY pb.id_pembinaan
       ORDER  BY MIN(pb.tgl_pembinaan) DESC
       LIMIT  ? OFFSET ?`,
      [...qparams, limit, offset],
    );

    return NextResponse.json({ data: rows, total: countRow?.total ?? 0, page, limit });
  } catch (err) {
    console.error('[pembinaan list]', err);
    return NextResponse.json({ error: 'Gagal memuat pembinaan.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json() as {
      tgl_pembinaan:   string;
      semesterid:      string;
      jenis_pembinaan: string;
      judul_materi:    string;
      pemateri:        string;
      kehadiran:       Record<string, { hadir: 'y' | 'n'; keterangan: string }>;
      mandiri:         Record<string, { bantu_ortu: boolean; sedekah: boolean; shalat_wajib: boolean; tilawah: boolean }>;
    };

    // Generate unique id_pembinaan (timestamp + random)
    const tglStr   = body.tgl_pembinaan.replace(/-/g, '');
    const idPembinaan = `${tglStr}${session.idWilayahPembinaan}${Date.now()}`.slice(0, 50);

    const d = new Date(body.tgl_pembinaan);
    const bulan = String(d.getMonth() + 1).padStart(2, '0');
    const tahun = String(d.getFullYear());

    // Get anak for this wilayah
    const { sql: scope, params: scopeParams } = getScopeCondition(session, 'a');
    const anakList = await query<{
      id_anak: string; nama_lengkap: string; jenjang_pendidikan: string;
      status_ortu: string; jns_kel: string; asnaf: string; nik: string;
      nama_lengkap_ayah: string; nama_lengkap_ibu: string; nama_lengkap_wali: string;
      kantor_id: string; nama_wilayah: string; nama_kantor: string;
    }>(
      `SELECT a.id_anak, a.nama_lengkap, a.jenjang_pendidikan,
              a.status_ortu, a.jns_kel, a.asnaf, a.nik,
              a.nama_lengkap_ayah, a.nama_lengkap_ibu, a.nama_lengkap_wali,
              a.kantor_id, a.nama_wilayah, a.nama_kantor
       FROM ajis_anak a WHERE ${scope} AND a.aktif='y'`,
      scopeParams,
    );

    // Insert one row per child
    for (const anak of anakList) {
      const kh = body.kehadiran[anak.id_anak] || { hadir: 'n', keterangan: '' };
      const m  = body.mandiri[anak.id_anak] || { bantu_ortu: false, sedekah: false, shalat_wajib: false, tilawah: false };

      await query(
        `INSERT INTO ajis_pembinaan_baru
           (id_pembinaan, tgl_pembinaan, semesterid, bulan, tahun,
            jenis_pembinaan, judul_materi, id_anak, kehadiran, keterangan,
            id_wilayah_pembinaan, user_insert, date_insert, kantor_id,
            jns_kel, asnaf, nik, nama_lengkap, jenjang_pendidikan, status_ortu,
            nama_lengkap_ayah, nama_lengkap_ibu, nama_lengkap_wali,
            nama_kantor, nama_wilayah, pemateri, pemateri_personal,
            ortu_hadir, id_donatur, nama_donatur, program_donasi, tampil, via_input,
            capaian_tilawah, capaian_tahfidz, capaian_tahfidz_hal,
            pembiasaan_shalat_wajib, pembiasaan_tilawah, pembiasaan_sedekah, membantu_ortu)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          idPembinaan, body.tgl_pembinaan, body.semesterid, bulan, tahun,
          body.jenis_pembinaan, body.judul_materi, anak.id_anak,
          kh.hadir, kh.keterangan || '',
          session.idWilayahPembinaan, session.username, anak.kantor_id,
          anak.jns_kel, anak.asnaf, anak.nik, anak.nama_lengkap,
          anak.jenjang_pendidikan, anak.status_ortu,
          anak.nama_lengkap_ayah, anak.nama_lengkap_ibu, anak.nama_lengkap_wali,
          anak.nama_kantor, anak.nama_wilayah,
          body.pemateri, '', '', '', '', '', 'y', 'web',
          '', '', '',
          m.shalat_wajib ? 1 : 0,
          m.tilawah      ? 1 : 0,
          m.sedekah      ? 1 : 0,
          m.bantu_ortu   ? 1 : 0,
        ],
      );
    }

    return NextResponse.json({ ok: true, id_pembinaan: idPembinaan }, { status: 201 });
  } catch (err) {
    console.error('[pembinaan post]', err);
    return NextResponse.json({ error: 'Gagal menyimpan pembinaan.' }, { status: 500 });
  }
}
