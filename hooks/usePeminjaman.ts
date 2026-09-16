'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type { KaryawanPeminjam, PeminjamanAnakRow } from '@/types/peminjaman';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal memuat data.');
  return json;
};

const BASE = '/api/anakjuara/peminjaman';

export function usePeminjamanList(
  params: Record<string, string | number> = {},
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const requestedPage = parseRequestedPage(params);

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });

  const key = enabled ? `${BASE}${qs.toString() ? `?${qs.toString()}` : ''}` : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: PeminjamanAnakRow[]; total: number; page: number; limit: number;
  }>(key, fetcher, LIST_SWR_OPTIONS);

  const responsePage = data?.page ?? 0;

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    page: responsePage,
    requestedPage,
    isReady: isListPageReady(requestedPage, responsePage, isLoading, isValidating),
    loading: isLoading,
    isValidating,
    error,
    mutate,
  };
}

/** ZISCO employees (id_jabatan 1198/1078) + their manager chain, cached an hour. */
export function useKaryawanPeminjam() {
  const { data, error, isLoading } = useSWR<{ data: KaryawanPeminjam[] }>(
    `${BASE}/karyawan`, fetcher, { revalidateOnFocus: false, dedupingInterval: 3_600_000 },
  );
  return { data: data?.data ?? [], loading: isLoading, error };
}
