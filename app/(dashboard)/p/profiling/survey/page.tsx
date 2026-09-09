/**
 * Data Survey — Postgres CRUD for ajis_survey (PRD §4 Profiling · Fase 1).
 */
import { Suspense } from 'react';
import { requireSession } from '@/lib/auth';
import { SurveyPengelolaanClient } from '@/components/survey-pg/SurveyPengelolaanClient';

export default async function DataSurveyPage() {
  await requireSession();
  // SurveyPengelolaanClient reads ?id_anak= via useSearchParams(), which
  // Next.js requires to be wrapped in a Suspense boundary.
  return (
    <Suspense>
      <SurveyPengelolaanClient />
    </Suspense>
  );
}
