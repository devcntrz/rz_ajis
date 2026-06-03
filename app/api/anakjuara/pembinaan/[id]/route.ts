/**
 * GET    /api/anakjuara/pembinaan/[id] — Session detail with all child rows
 * PUT    /api/anakjuara/pembinaan/[id] — Update session header + attendance
 * DELETE /api/anakjuara/pembinaan/[id] — Delete all rows for a session
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { p3aValue } from '@/lib/pembinaanConstants';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const header = await query<{
      id_pembinaan: string; tgl_pembinaan: string; semesterid: string;
      semester_label: string;
      jenis_pembinaan: string; p3a: string; judul_materi: string; pemateri: string;
      nama_wilayah: string; nama_kantor: string; id_wilayah_pembinaan: string;
    }>(
      `SELECT pb.id_pembinaan, MIN(pb.tgl_pembinaan) AS tgl_pembinaan,
              MIN(pb.semesterid) AS semesterid,
              MIN(sem.semester) AS semester_label,
              MIN(pb.jenis_pembinaan) AS jenis_pembinaan,
              MIN(pb.p3a) AS p3a,
              COALESCE(
                MIN(CASE WHEN pb.kehadiran = 'y' THEN pb.judul_materi ELSE NULL END),
                MIN(pb.judul_materi)
              ) AS judul_materi,
              COALESCE(
                MIN(CASE WHEN pb.kehadiran = 'y' THEN pb.pemateri ELSE NULL END),
                MIN(pb.pemateri)
              ) AS pemateri,
              MIN(pb.nama_wilayah) AS nama_wilayah,
              MIN(pb.nama_kantor) AS nama_kantor,
              MIN(pb.id_wilayah_pembinaan) AS id_wilayah_pembinaan
       FROM ajis_pembinaan_baru pb
       LEFT JOIN ajis_semester sem ON sem.semesterid = pb.semesterid
       WHERE pb.id_pembinaan = ?
       GROUP BY pb.id_pembinaan
       LIMIT 1`,
      [id],
    );

    if (!header.length) return NextResponse.json({ error: 'Session tidak ditemukan.' }, { status: 404 });

    const anakRows = await query<{
      id_row: number; id_anak: string; nama_lengkap: string;
      jenjang_pendidikan: string; jns_kel: string; status_ortu: string;
      kehadiran: string; keterangan: string; ortu_hadir: string;
      membantu_ortu: number; pembiasaan_shalat_wajib: number;
      pembiasaan_tilawah: number; pembiasaan_sedekah: number;
    }>(
      `SELECT id_row, id_anak, nama_lengkap, jenjang_pendidikan, jns_kel, status_ortu,
              kehadiran, keterangan, ortu_hadir,
              membantu_ortu, pembiasaan_shalat_wajib,
              pembiasaan_tilawah, pembiasaan_sedekah
       FROM ajis_pembinaan_baru
       WHERE id_pembinaan = ?
       ORDER BY nama_lengkap`,
      [id],
    );

    return NextResponse.json({ data: { ...header[0], anak: anakRows } });
  } catch (err) {
    console.error('[pembinaan detail]', err);
    return NextResponse.json({ error: 'Gagal memuat detail pembinaan.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json() as {
      jenis_pembinaan?: string;
      p3a?:             string;
      judul_materi?:    string;
      pemateri?:        string;
      kehadiran:        Record<string, { hadir: 'y' | 'n'; keterangan: string }>;
      mandiri:          Record<string, { bantu_ortu: boolean; sedekah: boolean; shalat_wajib: boolean; tilawah: boolean }>;
      ortu_hadir?:      Record<string, string>;
    };

    const [existing] = await query<{ jenis_pembinaan: string; p3a: string; judul_materi: string; pemateri: string }>(
      `SELECT MIN(jenis_pembinaan) AS jenis_pembinaan, MIN(p3a) AS p3a,
              COALESCE(
                MIN(CASE WHEN kehadiran = 'y' THEN judul_materi ELSE NULL END),
                MIN(judul_materi)
              ) AS judul_materi,
              COALESCE(
                MIN(CASE WHEN kehadiran = 'y' THEN pemateri ELSE NULL END),
                MIN(pemateri)
              ) AS pemateri
       FROM ajis_pembinaan_baru WHERE id_pembinaan = ?`,
      [id],
    );
    if (!existing) return NextResponse.json({ error: 'Session tidak ditemukan.' }, { status: 404 });

    const jenis = body.jenis_pembinaan?.trim() || existing.jenis_pembinaan;
    const judul = body.judul_materi?.trim() || existing.judul_materi;
    const pemateri = body.pemateri?.trim() || existing.pemateri;
    const p3aInput = body.p3a !== undefined ? body.p3a : existing.p3a;
    const p3a = p3aValue(jenis, p3aInput);

    if (jenis === 'P3A' && !p3aInput.trim()) {
      return NextResponse.json({ error: 'Field P3A wajib diisi.' }, { status: 400 });
    }
    const isParenting = jenis === 'Parenting';

    if (!judul) return NextResponse.json({ error: 'Tema materi wajib diisi.' }, { status: 400 });
    if (!pemateri) return NextResponse.json({ error: 'Pemateri wajib dipilih.' }, { status: 400 });

    for (const [anakId, kh] of Object.entries(body.kehadiran)) {
      const m = body.mandiri[anakId] || {};
      const ortu = isParenting && kh.hadir === 'y'
        ? (body.ortu_hadir?.[anakId] || '')
        : '';

      if (isParenting && kh.hadir === 'y' && !ortu) {
        return NextResponse.json({ error: 'Ortu hadir wajib untuk setiap anak yang hadir.' }, { status: 400 });
      }

      await query(
        `UPDATE ajis_pembinaan_baru
         SET jenis_pembinaan = ?, p3a = ?, judul_materi = ?, pemateri = ?,
             kehadiran = ?, keterangan = ?, ortu_hadir = ?,
             membantu_ortu = ?, pembiasaan_shalat_wajib = ?,
             pembiasaan_tilawah = ?, pembiasaan_sedekah = ?,
             user_update = ?, date_update = CURDATE()
         WHERE id_pembinaan = ? AND id_anak = ?`,
        [
          jenis, p3a, judul, pemateri,
          kh.hadir, kh.keterangan || '',
          ortu,
          m.bantu_ortu   ? 1 : 0,
          m.shalat_wajib ? 1 : 0,
          m.tilawah      ? 1 : 0,
          m.sedekah      ? 1 : 0,
          session.username, id, anakId,
        ],
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[pembinaan put]', err);
    return NextResponse.json({ error: 'Gagal update pembinaan.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await query(`DELETE FROM ajis_pembinaan_baru WHERE id_pembinaan = ?`, [id]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[pembinaan delete]', err);
    return NextResponse.json({ error: 'Gagal hapus pembinaan.' }, { status: 500 });
  }
}
