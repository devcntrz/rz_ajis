'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import type { AjuanGantiAnak } from '@/types/ajuan';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useAjuanList(
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
    ? `/api/anakjuara/ajuan-ganti-anak${queryString ? `?${queryString}` : ''}`
    : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: AjuanGantiAnak[];
    total: number;
    page: number;
    limit: number;
    error?: string;
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
    error:        data?.error || error,
    mutate,
  };
}
