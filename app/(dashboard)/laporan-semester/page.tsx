/**
 * Laporan Semester (Lapsem + Rekap) — replaces the legacy `LaporanPembinaanBaru`
 * page's two tabs of the same name ("Generate Pembinaan" tab is out of scope).
 * Access: id_group_user 1 | 2 only, same as Anak Juara.
 */
import { redirect } from 'next/navigation';
import { requireSession, isGroup12 } from '@/lib/auth';
import { LaporanSemesterClient } from './LaporanSemesterClient';

export default async function LaporanSemesterPage() {
  const session = await requireSession();
  if (!isGroup12(session)) {
    redirect('/');
  }

  return <LaporanSemesterClient idGroupUser={session.idGroupUser} canApprove={session.idGroupUser === 1 || session.idGroupUser === 2} />;
}
