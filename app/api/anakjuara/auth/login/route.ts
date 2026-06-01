/**
 * POST /api/anakjuara/auth/login
 * Real MD5 login against ajis_user table.
 * Uses MySQL's MD5() function to compare passwords.
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { AjisUser } from '@/types/user';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as { username: string; password: string };

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    // Compare password using MySQL's MD5() function (matches existing hash format)
    const user = await queryOne<AjisUser>(
      `SELECT id_user, username, id_kantor, nama_kantor, nama_wilayah,
              aktif, id_group_user, id_wilayah_pembinaan
       FROM   ajis_user
       WHERE  username = ? AND password = MD5(?) AND aktif = 'y'
       LIMIT  1`,
      [username.trim(), password],
    );

    if (!user) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    // Save session
    const session = await getSession();
    session.userId             = user.id_user;
    session.username           = user.username;
    session.namaKantor         = user.nama_kantor || '';
    session.namaWilayah        = user.nama_wilayah || '';
    session.idKantor           = user.id_kantor || '';
    session.idGroupUser        = user.id_group_user;
    session.idWilayahPembinaan = user.id_wilayah_pembinaan || '';
    session.isLoggedIn         = true;
    await session.save();

    return NextResponse.json({
      ok: true,
      user: {
        userId:             session.userId,
        username:           session.username,
        namaKantor:         session.namaKantor,
        namaWilayah:        session.namaWilayah,
        idGroupUser:        session.idGroupUser,
        idWilayahPembinaan: session.idWilayahPembinaan,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
