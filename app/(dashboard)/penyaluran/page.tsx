/**
 * Penyaluran — tab Wilayah (batch) + tab Anak (lintas batch), dari `ajis_penyaluran`
 * (PRD-Penyaluran-NextJS §5.0-§5.5). Access: id_group_user 1 | 2.
 */
import { redirect } from 'next/navigation';
import { requireSession, isGroup12 } from '@/lib/auth';
import { PenyaluranClient } from './PenyaluranClient';

export default async function PenyaluranPage() {
  const session = await requireSession();
  if (!isGroup12(session)) {
    redirect('/');
  }

  return <PenyaluranClient />;
}
