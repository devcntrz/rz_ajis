'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type { Pembinaan, PembinaanAnakRow } from '@/types/pembinaan';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePembinaanList(
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
    ? `/api/anakjuara/pembinaan${queryString ? `?${queryString}` : ''}`
    : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: Pembinaan[];
    total: number;
    page: number;
    limit: number;
  }>(key, fetcher, LIST_SWR_OPTIONS);

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

export function usePembinaanDetail(id: string) {
  const { data, error, mutate } = useSWR<{ data: Pembinaan & { anak: PembinaanAnakRow[] } }>(
    id ? `/api/anakjuara/pembinaan/${id}` : null,
    fetcher,
  );

  return {
    session: data?.data ?? null,
    loading: !data && !error,
    error,
    mutate,
  };
}
