/**
 * Input Donasi — grid + New Single, dari `ajis_input_donasi` (PRD-Penyaluran-NextJS §5.1-5.2).
 * Access: id_group_user 1 | 2.
 */
import { redirect } from 'next/navigation';
import { requireSession, isGroup12 } from '@/lib/auth';
import { InputDonasiClient } from './InputDonasiClient';

export default async function InputDonasiPage() {
  const session = await requireSession();
  if (!isGroup12(session)) {
    redirect('/');
  }

  return <InputDonasiClient idGroupUser={session.idGroupUser} />;
}
