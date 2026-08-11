/**
 * POST /api/anakjuara/ajuan-ganti-anak/[id]/ulangi
 * Reset approve_funding to pending. Blocked if already executed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession, requireGroup12, getKantorScope } from '@/lib/auth';

export async function POST(
  _req: NextRequest,
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
    const idAjuan = Number(id);
    if (!idAjuan) {
      return NextResponse.json({ error: 'ID ajuan tidak valid.' }, { status: 400 });
    }

    const { sql: scopeSql, params: scopeParams } = getKantorScope(session, 'id_kantor', 'a');
    const row = await queryOne<{ id_ajuan: number; status_eksekusi: string }>(
      `SELECT a.id_ajuan, a.status_eksekusi
       FROM ajis_view_ajuan a
       WHERE a.id_ajuan = ? AND ${scopeSql}
       LIMIT 1`,
      [idAjuan, ...scopeParams],
    );

    if (!row) {
      return NextResponse.json({ error: 'Ajuan tidak ditemukan.' }, { status: 404 });
    }
    if (row.status_eksekusi === 'y') {
      return NextResponse.json(
        { error: 'Ajuan sudah dieksekusi. Ulangi tidak diizinkan.' },
        { status: 400 },
      );
    }

    await query(
      `UPDATE ajis_view_ajuan
       SET approve_funding = 't',
           tgl_approve_funding = '0000-00-00 00:00:00',
           alasan_reject = ''
       WHERE id_ajuan = ?`,
      [idAjuan],
    );

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error('[ajuan ulangi]', err);
    return NextResponse.json({ error: 'Gagal mengulangi ajuan.' }, { status: 500 });
  }
}
