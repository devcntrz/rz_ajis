/**
 * GET /api/anakjuara/peminjaman/karyawan — ZISCO employees eligible as
 * "peminjam" (id_jabatan 1198/1078), plus their full manager chain, read
 * read-only from zains_rz.hcm_karyawan (lib/hcm.ts). No write ever happens
 * through this connection.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchZiscoWithAtasan } from '@/lib/hcm';
import type { KaryawanPeminjam } from '@/types/peminjaman';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await fetchZiscoWithAtasan();
    const data: KaryawanPeminjam[] = rows.map(k => ({
      id_karyawan: k.id_karyawan,
      nama:        k.karyawan,
      panggilan:   k.panggilan,
      id_jabatan:  k.id_jabatan,
      id_kantor:   k.id_kantor,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[peminjaman karyawan]', err);
    return NextResponse.json({ error: 'Gagal memuat data karyawan ZISCO.' }, { status: 500 });
  }
}
