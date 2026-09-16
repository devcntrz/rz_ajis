/**
 * Peminjaman Anak — MySQL sipc_ijf.ajis_peminjaman_anak (transisi track).
 * Borrower is a donor or a ZISCO employee (zains_rz.hcm_karyawan, read-only via lib/hcm.ts).
 */
import { requireSession } from '@/lib/auth';
import { PeminjamanClient } from '@/components/peminjaman/PeminjamanClient';

export default async function PeminjamanAnakPage() {
  const session = await requireSession();
  return <PeminjamanClient idGroupUser={session.idGroupUser} />;
}
