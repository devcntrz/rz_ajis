/**
 * Data Survey — MySQL CRUD for ajis_survey (transisi track).
 */
import { Suspense } from 'react';
import { requireSession } from '@/lib/auth';
import { SurveyClient } from '@/components/survey/SurveyClient';

export default async function SurveyPage() {
  await requireSession();
  // SurveyClient reads ?id_anak= via useSearchParams(), which Next.js
  // requires to be wrapped in a Suspense boundary.
  return (
    <Suspense>
      <SurveyClient />
    </Suspense>
  );
}
