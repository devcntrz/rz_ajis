'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type { LapsemRow } from '@/types/laporan-semester';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useLapsem(params: Record<string, string | number> = {}) {
  const requestedPage = parseRequestedPage(params);

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });

  const queryString = query.toString();
  const key = `/api/anakjuara/laporan-semester${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: LapsemRow[];
    pagination: { page: number; limit: number; total: number };
    error?: string;
  }>(key, fetcher, LIST_SWR_OPTIONS);

  const responsePage = data?.pagination?.page ?? 0;
  const isReady = isListPageReady(requestedPage, responsePage, isLoading, isValidating);

  return {
    data:         data?.data ?? [],
    total:        data?.pagination?.total ?? 0,
    page:         responsePage,
    requestedPage,
    isReady,
    loading:      isLoading,
    isValidating,
    error:        data?.error || error,
    mutate,
  };
}
