/**
 * Manajemen User — Postgres CRUD for ajis_user (PRD §4 Master).
 */
import { requireSession } from '@/lib/auth';
import { UserPengelolaanClient } from '@/components/user-pg/UserPengelolaanClient';

export default async function ManajemenUserPage() {
  const session = await requireSession();
  return <UserPengelolaanClient isSuperAdmin={session.idGroupUser === 1} />;
}
