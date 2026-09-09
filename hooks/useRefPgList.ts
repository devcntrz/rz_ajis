'use client';
import useSWR from 'swr';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import { useDebouncedValue } from '@/hooks/useAnakPgList';
import type {
  RefPropinsiPgListParams, RefPropinsiPgListResponse, RefPropinsiLookupItem,
  RefKabupatenPgListParams, RefKabupatenPgListResponse, RefKabupatenLookupItem,
  RefKecamatanPgListParams, RefKecamatanPgListResponse, RefKecamatanLookupItem,
  RefDesaPgListParams, RefDesaPgListResponse, RefDesaLookupItem,
} from '@/types/ref-pg';

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

const BASE = '/api/anakjuara/pg/ref';

/* ---------------------------------------------------------------------- */
/* Propinsi                                                                */
/* ---------------------------------------------------------------------- */

export function usePropinsiPgList(params: RefPropinsiPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<RefPropinsiPgListResponse>(
    `${BASE}/propinsi?${qs}`,
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

/** Autocomplete source for a Propinsi `<select>` — root of the cascading
 *  Propinsi→Kabupaten→Kecamatan→Desa pickers. `q` is debounced 300ms; an
 *  empty `q` still returns the first 50 (aktif) rows. */
export function usePropinsiLookup(q?: string) {
  const debouncedQ = useDebouncedValue(q ?? '', 300);
  const qs = toQuery({ q: debouncedQ });

  const { data, error, isLoading } = useSWR<RefPropinsiLookupItem[]>(
    `${BASE}/propinsi/lookup?${qs}`,
    fetcher,
    { ...LIST_SWR_OPTIONS, dedupingInterval: 30_000 },
  );

  return { data: data ?? [], loading: isLoading, error: error as Error | undefined };
}

/* ---------------------------------------------------------------------- */
/* Kabupaten                                                               */
/* ---------------------------------------------------------------------- */

export function useKabupatenPgList(params: RefKabupatenPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<RefKabupatenPgListResponse>(
    `${BASE}/kabupaten?${qs}`,
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

/** Autocomplete source for a Kabupaten `<select>`, narrowed by `propid`
 *  (pass the propid chosen from usePropinsiLookup). Empty `propid` returns
 *  the first 50 rows across all propinsi. */
export function useKabupatenLookup(q?: string, propid?: string) {
  const debouncedQ = useDebouncedValue(q ?? '', 300);
  const qs = toQuery({ q: debouncedQ, propid });

  const { data, error, isLoading } = useSWR<RefKabupatenLookupItem[]>(
    `${BASE}/kabupaten/lookup?${qs}`,
    fetcher,
    { ...LIST_SWR_OPTIONS, dedupingInterval: 30_000 },
  );

  return { data: data ?? [], loading: isLoading, error: error as Error | undefined };
}

/* ---------------------------------------------------------------------- */
/* Kecamatan                                                               */
/* ---------------------------------------------------------------------- */

export function useKecamatanPgList(params: RefKecamatanPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<RefKecamatanPgListResponse>(
    `${BASE}/kecamatan?${qs}`,
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

/** Autocomplete source for a Kecamatan `<select>`, narrowed by `kabid`
 *  (pass the kabid chosen from useKabupatenLookup). */
export function useKecamatanLookup(q?: string, kabid?: string) {
  const debouncedQ = useDebouncedValue(q ?? '', 300);
  const qs = toQuery({ q: debouncedQ, kabid });

  const { data, error, isLoading } = useSWR<RefKecamatanLookupItem[]>(
    `${BASE}/kecamatan/lookup?${qs}`,
    fetcher,
    { ...LIST_SWR_OPTIONS, dedupingInterval: 30_000 },
  );

  return { data: data ?? [], loading: isLoading, error: error as Error | undefined };
}

/* ---------------------------------------------------------------------- */
/* Desa / Kelurahan                                                        */
/* ---------------------------------------------------------------------- */

export function useDesaPgList(params: RefDesaPgListParams) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 300);
  const qs = toQuery({ ...params, q: debouncedQ });

  const { data, error, isLoading, isValidating, mutate } = useSWR<RefDesaPgListResponse>(
    `${BASE}/desa?${qs}`,
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

/** Autocomplete source for a Desa/Kelurahan `<select>`, narrowed by
 *  `camatid` (pass the camatid chosen from useKecamatanLookup). */
export function useDesaLookup(q?: string, camatid?: string) {
  const debouncedQ = useDebouncedValue(q ?? '', 300);
  const qs = toQuery({ q: debouncedQ, camatid });

  const { data, error, isLoading } = useSWR<RefDesaLookupItem[]>(
    `${BASE}/desa/lookup?${qs}`,
    fetcher,
    { ...LIST_SWR_OPTIONS, dedupingInterval: 30_000 },
  );

  return { data: data ?? [], loading: isLoading, error: error as Error | undefined };
}
