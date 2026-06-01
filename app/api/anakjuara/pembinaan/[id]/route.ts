/**
 * GET    /api/anakjuara/pembinaan/[id] — Session detail with all child rows
 * PUT    /api/anakjuara/pembinaan/[id] — Update kehadiran/mandiri for a session
 * DELETE /api/anakjuara/pembinaan/[id] — Delete all rows for a session
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Session header (from first row)
    const header = await query<{
      id_pembinaan: string; tgl_pembinaan: string; semesterid: string;
      jenis_pembinaan: string; judul_materi: string; pemateri: string;
      nama_wilayah: string; nama_kantor: string; id_wilayah_pembinaan: string;
    }>(
      `SELECT id_pembinaan, MIN(tgl_pembinaan) AS tgl_pembinaan,
              MIN(semesterid) AS semesterid,
              MIN(jenis_pembinaan) AS jenis_pembinaan,
              MIN(judul_materi) AS judul_materi,
              MIN(pemateri) AS pemateri,
              MIN(nama_wilayah) AS nama_wilayah,
              MIN(nama_kantor) AS nama_kantor,
              MIN(id_wilayah_pembinaan) AS id_wilayah_pembinaan
       FROM ajis_pembinaan_baru
       WHERE id_pembinaan = ?
       GROUP BY id_pembinaan
       LIMIT 1`,
      [id],
    );

    if (!header.length) return NextResponse.json({ error: 'Session tidak ditemukan.' }, { status: 404 });

    // All child attendance rows
    const anakRows = await query<{
      id_row: number; id_anak: string; nama_lengkap: string;
      jenjang_pendidikan: string; jns_kel: string; status_ortu: string;
      kehadiran: string; keterangan: string;
      membantu_ortu: number; pembiasaan_shalat_wajib: number;
      pembiasaan_tilawah: number; pembiasaan_sedekah: number;
    }>(
      `SELECT id_row, id_anak, nama_lengkap, jenjang_pendidikan, jns_kel, status_ortu,
              kehadiran, keterangan,
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
      kehadiran: Record<string, { hadir: 'y' | 'n'; keterangan: string }>;
      mandiri:   Record<string, { bantu_ortu: boolean; sedekah: boolean; shalat_wajib: boolean; tilawah: boolean }>;
    };

    for (const [anakId, kh] of Object.entries(body.kehadiran)) {
      const m = body.mandiri[anakId] || {};
      await query(
        `UPDATE ajis_pembinaan_baru
         SET kehadiran = ?, keterangan = ?,
             membantu_ortu = ?, pembiasaan_shalat_wajib = ?,
             pembiasaan_tilawah = ?, pembiasaan_sedekah = ?,
             user_update = ?, date_update = CURDATE()
         WHERE id_pembinaan = ? AND id_anak = ?`,
        [
          kh.hadir, kh.keterangan || '',
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
