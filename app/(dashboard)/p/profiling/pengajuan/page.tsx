/**
 * Pengajuan Beasiswa — Postgres CRUD for ajis_anak (PRD §4 Profiling · Fase 1).
 */
import { requireSession } from '@/lib/auth';
import { AnakPengajuanClient } from '@/components/anak-pg/AnakPengajuanClient';

export default async function PengajuanBeasiswaPage() {
  await requireSession();
  return <AnakPengajuanClient />;
}
