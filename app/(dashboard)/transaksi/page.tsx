/**
 * Transaksi — donation cashflow into Anak Juara.
 *
 * Replaces the legacy pair `Transaksi` (SpMD cabang) and `TransaksiAdmin`, which were
 * two near-identical EasyUI pages only because that stack could not vary one page by
 * role. Access: id_group_user 1 | 2.
 */
import { redirect } from 'next/navigation';
import { requireSession, isGroup12 } from '@/lib/auth';
import { TransaksiClient } from './TransaksiClient';

export default async function TransaksiPage() {
  const session = await requireSession();
  if (!isGroup12(session)) {
    redirect('/');
  }

  return <TransaksiClient idGroupUser={session.idGroupUser} />;
}
