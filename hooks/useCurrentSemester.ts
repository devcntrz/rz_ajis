'use client';
import useSWR from 'swr';
import type { SemesterOption } from '@/types/semester';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useCurrentSemester(enabled = true) {
  const { data, isLoading } = useSWR<{ data: SemesterOption[] }>(
    enabled ? '/api/anakjuara/semester?limit=40' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  const options = data?.data ?? [];
  const current = options.find(s => s.is_current) ?? options[0] ?? null;

  return { current, options, loading: enabled && isLoading };
}
