/**
 * GET /api/anakjuara/ajuan-ganti-anak/options/donatur?id_donatur=…
 * Donor fields shown read-only in the Entry Ajuan Ganti modal (oID Donatur,
 * Kantor Donatur, Jenis Donatur, No HP). Display only — the POST handler looks
 * these up again server-side and never trusts what the client sends back.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireGroup12 } from '@/lib/auth';
import { getDonaturSnapshot } from '@/lib/donatur';

export async function GET(req: NextRequest) {
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

    const idDonatur = req.nextUrl.searchParams.get('id_donatur') || '';
    if (!idDonatur) {
      return NextResponse.json({ error: 'id_donatur wajib diisi.' }, { status: 400 });
    }

    return NextResponse.json({ data: await getDonaturSnapshot(idDonatur) });
  } catch (err) {
    console.error('[options donatur]', err);
    return NextResponse.json({ error: 'Gagal memuat data donatur.' }, { status: 500 });
  }
}
