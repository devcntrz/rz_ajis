/**
 * Setting Propinsi/Kab/Kec/Kel — Postgres CRUD for the administrative
 * reference hierarchy (ref_propinsi, ref_kabupaten, ref_kecamatan, ref_desa).
 */
import { requireSession } from '@/lib/auth';
import { RefWilayahAdminClient } from '@/components/ref-pg/RefWilayahAdminClient';

export default async function MasterWilayahAdminPage() {
  const session = await requireSession();
  return <RefWilayahAdminClient canManage={session.idGroupUser === 1} />;
}
