/**
 * GET /api/anakjuara/anak/[id]/kehadiran
 * Attendance history for a child from ajis_pembinaan_baru.
 *
 * Semester filter is not only `pb.semesterid = ?`. Legacy rows sometimes store a
 * different id, the semester *name*, or leave semesterid empty while tgl_pembinaan
 * still falls in the active period. Match all of those so the profile tab shows
 * the same sessions as Pembinaan detail.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const semester = (req.nextUrl.searchParams.get('semester') || '').trim();

    const anak = await queryOne<{
      id_anak: string;
      nama_lengkap: string;
      id_wilayah_pembinaan: string | number;
    }>(
      `SELECT id_anak, nama_lengkap, id_wilayah_pembinaan
       FROM ajis_anak WHERE id_anak = ? LIMIT 1`,
      [id],
    );

    if (!anak) {
      return NextResponse.json({ error: 'Anak tidak ditemukan.', code: 'NOT_FOUND' }, { status: 404 });
    }

    const aliases = await query<{ id_anak: string }>(
      `SELECT id_anak FROM ajis_anak
       WHERE nama_lengkap = ? AND CAST(id_wilayah_pembinaan AS CHAR) = CAST(? AS CHAR)
       LIMIT 20`,
      [anak.nama_lengkap, anak.id_wilayah_pembinaan],
    );
    const idSet = new Set<string>([anak.id_anak, id, ...aliases.map(a => a.id_anak)]);
    const ids = [...idSet].filter(Boolean);

    const sem = semester
      ? await queryOne<{ semesterid: string; semester: string; tgl_awal: string; tgl_akhir: string }>(
        `SELECT semesterid, semester, tgl_awal, tgl_akhir
         FROM ajis_semester WHERE semesterid = ? LIMIT 1`,
        [semester],
      )
      : null;

    const idPlaceholders = ids.map(() => '?').join(', ');
    const semClause = semester
      ? sem?.semester && sem.semester !== semester
        ? 'AND (pb.semesterid = ? OR pb.semesterid = ?)'
        : 'AND pb.semesterid = ?'
      : '';
    const semParams = semester
      ? (sem?.semester && sem.semester !== semester ? [semester, sem.semester] : [semester])
      : [];

    const selectCols = `pb.id_row, pb.id_anak, pb.id_pembinaan, pb.tgl_pembinaan, pb.semesterid,
              pb.jenis_pembinaan, pb.judul_materi, pb.pemateri,
              pb.kehadiran, pb.keterangan,
              pb.membantu_ortu, pb.pembiasaan_shalat_wajib,
              pb.pembiasaan_tilawah, pb.pembiasaan_sedekah`;

    type Row = {
      id_row: number;
      id_anak: string;
      id_pembinaan: string;
      tgl_pembinaan: string;
      semesterid: string;
      jenis_pembinaan: string;
      judul_materi: string;
      pemateri: string;
      kehadiran: string;
      keterangan: string;
      membantu_ortu: number;
      pembiasaan_shalat_wajib: number;
      pembiasaan_tilawah: number;
      pembiasaan_sedekah: number;
    };

    async function fetchRows(where: string, params: unknown[]): Promise<Row[]> {
      return query<Row>(
        `SELECT ${selectCols}
         FROM   ajis_pembinaan_baru pb
         WHERE  ${where}
         ORDER  BY pb.tgl_pembinaan DESC
         LIMIT  100`,
        params,
      );
    }

    let rows = await fetchRows(
      `pb.id_anak IN (${idPlaceholders}) ${semClause}`,
      [...ids, ...semParams],
    );

    // These two fallbacks match by nama_lengkap + id_wilayah_pembinaan (CAST to
    // compare across the column's varying legacy types) instead of id_anak, to
    // cover rows saved under an aliased id. Neither column is indexed for this
    // combination, and ajis_pembinaan_baru has ~2.8M rows on MyISAM (table-level
    // locking) — an unbounded scan here has been observed to run 40+ minutes on
    // production, and for that whole time it holds up every other MyISAM write
    // (including ajis_anak, e.g. the ajuan-ganti-anak eksekusi flow) queued
    // behind the table lock. MAX_EXECUTION_TIME caps the damage: if it can't
    // finish fast, fail this fallback and fall through to "no data" rather than
    // degrade the whole app.
    const FALLBACK_TIMEOUT_MS = 3000;
    async function fetchRowsBounded(where: string, params: unknown[]): Promise<Row[]> {
      try {
        return await query<Row>(
          `SELECT /*+ MAX_EXECUTION_TIME(${FALLBACK_TIMEOUT_MS}) */ ${selectCols}
           FROM   ajis_pembinaan_baru pb
           WHERE  ${where}
           ORDER  BY pb.tgl_pembinaan DESC
           LIMIT  100`,
          params,
        );
      } catch (err) {
        console.error('[kehadiran] nama_lengkap fallback aborted (likely MAX_EXECUTION_TIME)', err);
        return [];
      }
    }

    if (rows.length === 0) {
      rows = await fetchRowsBounded(
        `pb.nama_lengkap = ? AND CAST(pb.id_wilayah_pembinaan AS CHAR) = CAST(? AS CHAR) ${semClause}`,
        [anak.nama_lengkap, anak.id_wilayah_pembinaan, ...semParams],
      );
    }

    if (rows.length === 0 && sem?.tgl_awal && sem?.tgl_akhir) {
      rows = await fetchRows(
        `pb.id_anak IN (${idPlaceholders})
         AND pb.tgl_pembinaan >= ? AND pb.tgl_pembinaan < DATE_ADD(?, INTERVAL 1 DAY)`,
        [...ids, sem.tgl_awal, sem.tgl_akhir],
      );
    }

    if (rows.length === 0 && sem?.tgl_awal && sem?.tgl_akhir) {
      rows = await fetchRowsBounded(
        `pb.nama_lengkap = ? AND CAST(pb.id_wilayah_pembinaan AS CHAR) = CAST(? AS CHAR)
         AND pb.tgl_pembinaan >= ? AND pb.tgl_pembinaan < DATE_ADD(?, INTERVAL 1 DAY)`,
        [anak.nama_lengkap, anak.id_wilayah_pembinaan, sem.tgl_awal, sem.tgl_akhir],
      );
    }

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('[kehadiran]', err);
    return NextResponse.json({ error: 'Gagal memuat kehadiran.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json() as {
      id_row?: number;
      id_pembinaan?: string;
      id_anak?: string;
      kehadiran?: string;
      keterangan?: string;
      mandiri?: {
        bantu_ortu?: boolean;
        shalat_wajib?: boolean;
        tilawah?: boolean;
        sedekah?: boolean;
      };
    };

    const hadir = body.kehadiran === 'y' ? 'y' : 'n';
    const ket = hadir === 'y' ? '' : String(body.keterangan || 'Alfa').trim();
    const m = body.mandiri ?? {};
    const targetAnak = String(body.id_anak || id).trim();
    const idPembinaan = String(body.id_pembinaan || '').trim();
    const idRow = Number(body.id_row || 0);

    if (!idPembinaan && !idRow) {
      return NextResponse.json({ error: 'id_pembinaan atau id_row wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    await query(
      `UPDATE ajis_pembinaan_baru
       SET kehadiran = ?, keterangan = ?,
           membantu_ortu = ?, pembiasaan_shalat_wajib = ?,
           pembiasaan_tilawah = ?, pembiasaan_sedekah = ?,
           user_update = ?, date_update = CURDATE()
       WHERE id_anak = ?
         AND (${idRow ? 'id_row = ?' : 'id_pembinaan = ?'})`,
      [
        hadir, ket,
        m.bantu_ortu ? 1 : 0,
        m.shalat_wajib ? 1 : 0,
        m.tilawah ? 1 : 0,
        m.sedekah ? 1 : 0,
        session.username, targetAnak,
        idRow || idPembinaan,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[kehadiran put]', err);
    return NextResponse.json({ error: 'Gagal menyimpan kehadiran.' }, { status: 500 });
  }
}
