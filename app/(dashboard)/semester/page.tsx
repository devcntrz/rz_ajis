/**
 * Semester admin CRUD — replaces the legacy `mod=ajis&file=Semester` page.
 * Access: id_group_user 1 | 2 only (matches requireGroup12 on the API routes).
 */
import { redirect } from 'next/navigation';
import { requireSession, isGroup12 } from '@/lib/auth';
import { SemesterClient } from './SemesterClient';

export default async function SemesterPage() {
  const session = await requireSession();
  if (!isGroup12(session)) {
    redirect('/');
  }

  return <SemesterClient />;
}
