'use client';
import useSWR from 'swr';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import { useDebouncedValue } from '@/hooks/useAnakPgList';
import type { AjisWilayahLookupItem, AjisWilayahPgListParams, AjisWilayahPgListResponse } from '@/types/wilayah-pg';

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

const BASE = '/api/anakjuara/pg/wilayah';

export function useWilayahPgList(params: AjisWilayahPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<AjisWilayahPgListResponse>(
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

/** Autocomplete source for a wilayah <select> elsewhere (e.g. cascading
 *  Kantor→Wilayah pickers in Manajemen User / Pengajuan Beasiswa). `q` is
 *  debounced 300ms; an empty `q` still returns the first 50 (scoped, aktif)
 *  rows since this is a small master table. Pass `kantorId` (an
 *  ajis_kantor.oid, e.g. from useKantorLookup) to narrow to that branch's
 *  regions. */
export function useWilayahLookup(q?: string, kantorId?: string) {
  const debouncedQ = useDebouncedValue(q ?? '', 300);
  const qs = toQuery({ q: debouncedQ, kantor_id: kantorId });

  const { data, error, isLoading } = useSWR<AjisWilayahLookupItem[]>(
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
