/**
 * GET /api/anakjuara/pg/group-user — role master list (ajis_group_user), for
 * populating the role <select> on the Manajemen User form.
 *
 * Small lookup master list — no role scoping needed (roles are global, not
 * per-branch/wilayah data), mirrors the shape of the anak-pg lookup route.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import type { AjisGroupUser } from '@/types/user-pg';

type Row = { id_group_user: number; group_user: string; keterangan: string | null; aktif: boolean };

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await query<Row>(
      `SELECT id_group_user, group_user, keterangan, aktif
       FROM ajis_group_user
       ORDER BY id_group_user ASC`,
    );

    const data: AjisGroupUser[] = rows.map(r => ({
      idGroupUser: r.id_group_user,
      groupUser: r.group_user,
      keterangan: r.keterangan,
      aktif: r.aktif,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[pg group-user list]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar peran.' }, { status: 500 });
  }
}
