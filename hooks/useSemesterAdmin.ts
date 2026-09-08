'use client';
import useSWR from 'swr';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type { Semester } from '@/types/semester';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSemesterAdmin(params: { page?: number; limit?: number; q?: string } = {}) {
  const query = new URLSearchParams({ mode: 'admin' });
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.q) query.append('q', params.q);

  const key = `/api/anakjuara/semester?${query.toString()}`;

  const { data, error, mutate, isLoading } = useSWR<{
    data: Semester[];
    pagination: { page: number; limit: number; total: number };
    error?: string;
  }>(key, fetcher, LIST_SWR_OPTIONS);

  return {
    data:    data?.data ?? [],
    total:   data?.pagination?.total ?? 0,
    loading: isLoading,
    error:   data?.error || error,
    mutate,
  };
}
