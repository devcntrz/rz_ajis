/**
 * PATCH …/anak-juara/[id]/program — change the pairing's program (id = id_pemasangan_baru).
 * Scope, per product decision: only id_program / program_donasi on ajis_pemasangan —
 * not the full legacy "Pindah Jenjang" (close pairing + insert new pairing).
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession, requireGroup12 } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const idPemasangan = decodeURIComponent(id);
    const body = await req.json();
    const idProgram = Number(body?.id_program);
    if (!idProgram || !Number.isFinite(idProgram)) {
      return NextResponse.json({ error: 'Program tidak valid.' }, { status: 400 });
    }

    const program = await queryOne<{ id_program: number; nama_program: string }>(
      `SELECT id_program, nama_program FROM setting_program WHERE id_program = ? AND aktif = 'y' LIMIT 1`,
      [idProgram],
    );
    if (!program) {
      return NextResponse.json({ error: 'Program tidak ditemukan atau sudah tidak aktif.' }, { status: 400 });
    }

    const pairing = await queryOne<{ id_pemasangan_baru: string }>(
      `SELECT id_pemasangan_baru FROM ajis_pemasangan WHERE id_pemasangan_baru = ? LIMIT 1`,
      [idPemasangan],
    );
    if (!pairing) {
      return NextResponse.json({ error: 'Pemasangan tidak ditemukan.' }, { status: 404 });
    }

    await execute(
      `UPDATE ajis_pemasangan
       SET id_program = ?, program_donasi = ?, user_update = ?, date_update = NOW()
       WHERE id_pemasangan_baru = ?`,
      [program.id_program, program.nama_program, session.username, idPemasangan],
    );

    return NextResponse.json({
      data: { ok: true, nama_program: program.nama_program },
      message: `Program diubah menjadi ${program.nama_program}.`,
    });
  } catch (err) {
    console.error('[anak-juara ganti-program]', err);
    return NextResponse.json({ error: 'Gagal mengganti program.', code: 'GANTI_PROGRAM_FAILED' }, { status: 500 });
  }
}
