/**
 * Master Kantor — Postgres CRUD for ajis_kantor (branch office master data).
 */
import { requireSession } from '@/lib/auth';
import { KantorPengelolaanClient } from '@/components/kantor-pg/KantorPengelolaanClient';

export default async function MasterKantorPage() {
  const session = await requireSession();
  return <KantorPengelolaanClient isSuperAdmin={session.idGroupUser === 1} />;
}
