'use client';
import useSWR from 'swr';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import { useDebouncedValue } from '@/hooks/useAnakPgList';
import type { AjisKantorLookupItem, AjisKantorPgListParams, AjisKantorPgListResponse } from '@/types/kantor-pg';

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

const BASE = '/api/anakjuara/pg/kantor';

export function useKantorPgList(params: AjisKantorPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<AjisKantorPgListResponse>(
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

/** Autocomplete source for a kantor <select> elsewhere (e.g. Master Wilayah
 *  Pembinaan). `q` is debounced 300ms; an empty `q` still returns the first 50
 *  rows since this is a small master table. */
export function useKantorLookup(q?: string, oidParent?: string) {
  const debouncedQ = useDebouncedValue(q ?? '', 300);
  const qs = toQuery({ q: debouncedQ, oid_parent: oidParent });

  const { data, error, isLoading } = useSWR<AjisKantorLookupItem[]>(
    `${BASE}/lookup?${qs}`,
    fetcher,
    { ...LIST_SWR_OPTIONS, dedupingInterval: 30_000 },
  );

  return {
    data: data ?? [],
    loading: isLoading,
    error: error as Error | undefined,
  };
}
