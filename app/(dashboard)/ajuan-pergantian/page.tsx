/**
 * List Ajuan Pergantian — ajis_view_ajuan workflow.
 * Access: id_group_user 1 | 2 only.
 */
import { redirect } from 'next/navigation';
import { requireSession, isGroup12 } from '@/lib/auth';
import { AjuanPergantianClient } from './AjuanPergantianClient';

export default async function AjuanPergantianPage() {
  const session = await requireSession();
  if (!isGroup12(session)) {
    redirect('/');
  }

  return <AjuanPergantianClient idGroupUser={session.idGroupUser} />;
}
