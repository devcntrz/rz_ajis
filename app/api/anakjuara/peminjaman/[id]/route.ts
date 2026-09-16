/** PATCH /api/anakjuara/peminjaman/{id} — cancel a loan (mirrors legacy PeminjamanDataCAJ_Update). */
import { NextRequest, NextResponse } from 'next/server';
import { withTransaction, txQueryOne, txExecute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RuleError } from '@/lib/transaksi/rules';

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idPeminjaman = Number(id);
    if (!Number.isInteger(idPeminjaman)) {
      return NextResponse.json({ error: 'ID peminjaman tidak valid.' }, { status: 400 });
    }

    const body = (await req.json()) as { alasan_cancel?: string };
    const alasan = body.alasan_cancel?.trim();
    if (!alasan) {
      return NextResponse.json({ error: 'Alasan pembatalan wajib diisi.', code: 'VALIDATION' }, { status: 400 });
    }

    await withTransaction(async conn => {
      const row = await txQueryOne<{ id_anak: string | null; cancel: 'y' | 'n' }>(
        conn, `SELECT id_anak, cancel FROM ajis_peminjaman_anak WHERE id_peminjaman = ? LIMIT 1`, [idPeminjaman],
      );
      if (!row) throw new RuleError('Peminjaman tidak ditemukan.');
      if (row.cancel === 'y') throw new RuleError('Peminjaman ini sudah dibatalkan.');

      await txExecute(
        conn,
        `UPDATE ajis_peminjaman_anak
         SET cancel = 'y', alasan_cancel = ?, tgl_selesai_peminjaman = CURDATE(), status_pinjam = 'n'
         WHERE id_peminjaman = ?`,
        [alasan, idPeminjaman],
      );
      if (row.id_anak) {
        await txExecute(conn, `UPDATE ajis_anak SET status_pinjam = 'n' WHERE id_anak = ?`, [row.id_anak]);
      }
    });

    return NextResponse.json({ message: 'Peminjaman dibatalkan.' });
  } catch (err) {
    if (err instanceof RuleError) {
      return NextResponse.json({ error: err.message, code: err.code ?? 'RULE' }, { status: 400 });
    }
    console.error('[peminjaman cancel]', err);
    return NextResponse.json({ error: 'Gagal membatalkan peminjaman.' }, { status: 500 });
  }
}
