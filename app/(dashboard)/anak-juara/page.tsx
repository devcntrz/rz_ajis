/**
 * Anak Juara list — pairing from ajis_pemasangan.
 * Access: id_group_user 1 | 2 only.
 */
import { redirect } from 'next/navigation';
import { requireSession, isGroup12 } from '@/lib/auth';
import { AnakJuaraClient } from './AnakJuaraClient';

export default async function AnakJuaraPage() {
  const session = await requireSession();
  if (!isGroup12(session)) {
    redirect('/');
  }

  return <AnakJuaraClient idGroupUser={session.idGroupUser} />;
}
