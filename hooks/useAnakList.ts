'use client';
import useSWR from 'swr';
import type { AnakListRow } from '@/types/anak';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useAnakList(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });

  const queryString = query.toString();
  const { data, error, mutate } = useSWR<{ data: AnakListRow[]; total: number }>(
    `/api/anakjuara/anak${queryString ? `?${queryString}` : ''}`,
    fetcher,
    { keepPreviousData: true },
  );

  return {
    data:    data?.data ?? [],
    total:   data?.total ?? 0,
    loading: !data && !error,
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
