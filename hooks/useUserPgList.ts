'use client';
import useSWR from 'swr';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import { useDebouncedValue } from '@/hooks/useAnakPgList';
import type { AjisGroupUser, AjisUserPgListParams, AjisUserPgListResponse } from '@/types/user-pg';

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

const BASE = '/api/anakjuara/pg/user';

export function useUserPgList(params: AjisUserPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<AjisUserPgListResponse>(
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

/** Role master list for the role <select> — long-lived, so a wide dedupingInterval. */
export function useGroupUserList() {
  const { data, error, isLoading } = useSWR<{ data: AjisGroupUser[] }>(
    '/api/anakjuara/pg/group-user',
    fetcher,
    { ...LIST_SWR_OPTIONS, dedupingInterval: 60_000 },
  );

  return {
    data: data?.data ?? [],
    loading: isLoading,
    error: error as Error | undefined,
  };
}
