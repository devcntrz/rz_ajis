'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import type { AnakListRow } from '@/types/anak';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useAnakList(
  params: Record<string, string | number> = {},
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const requestedPage = parseRequestedPage(params);

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });

  const queryString = query.toString();
  const key = enabled
    ? `/api/anakjuara/anak${queryString ? `?${queryString}` : ''}`
    : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: AnakListRow[];
    total: number;
    page: number;
    limit: number;
  }>(key, fetcher);

  const responsePage = data?.page ?? 0;
  const isReady = isListPageReady(requestedPage, responsePage, isLoading, isValidating);

  return {
    data:         data?.data ?? [],
    total:        data?.total ?? 0,
    page:         responsePage,
    requestedPage,
    isReady,
    loading:      isLoading,
    isValidating,
    error,
    mutate,
  };
}

export function useAnakDetail(id: string) {
  const { data, error, mutate } = useSWR<{ data: any }>(
    id ? `/api/anakjuara/anak/${id}` : null,
    fetcher,
  );

  return {
    anak:    data?.data ?? null,
    loading: !data && !error,
    error,
    mutate,
  };
}
