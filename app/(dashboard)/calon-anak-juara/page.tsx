/**
 * Calon Anak Juara list — MySQL ajis_anak where status_anak_juara = 'caj'.
 */
import { requireSession } from '@/lib/auth';
import { CalonAnakJuaraClient } from './CalonAnakJuaraClient';

export default async function CalonAnakJuaraPage() {
  const session = await requireSession();
  return <CalonAnakJuaraClient idGroupUser={session.idGroupUser} />;
}
