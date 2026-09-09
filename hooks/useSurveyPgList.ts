'use client';
import useSWR from 'swr';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import { useDebouncedValue } from '@/hooks/useAnakPgList';
import type { AjisSurveyPgListParams, AjisSurveyPgListResponse } from '@/types/survey-pg';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal memuat data.');
  return json;
};

function toQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  return qs.toString();
}

const BASE = '/api/anakjuara/pg/survey';

export function useSurveyPgList(params: AjisSurveyPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<AjisSurveyPgListResponse>(
    `${BASE}?${qs}`,
    fetcher,
    { ...LIST_SWR_OPTIONS, dedupingInterval: 30_000 },
  );

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 50,
    loading: isLoading,
    isValidating,
    error: error as Error | undefined,
    mutate,
  };
}
