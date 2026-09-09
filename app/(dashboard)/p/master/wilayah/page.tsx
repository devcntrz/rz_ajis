/**
 * Data Wilayah — Postgres CRUD for ajis_wilayah_pembinaan (coaching-region
 * master data).
 */
import { requireSession, isGroup12 } from '@/lib/auth';
import { WilayahPengelolaanClient } from '@/components/wilayah-pg/WilayahPengelolaanClient';

export default async function MasterWilayahPage() {
  const session = await requireSession();
  return (
    <WilayahPengelolaanClient
      canManage={isGroup12(session)}
      canDelete={session.idGroupUser === 1}
    />
  );
}
