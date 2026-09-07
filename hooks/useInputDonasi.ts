'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type {
  AnakDonasiOption, DonaturOption, InputDonasi, TransaksiDonasiOption,
} from '@/types/input-donasi';

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

const BASE = '/api/anakjuara/input-donasi';

export function useInputDonasiList(
  params: Record<string, string | number> = {},
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const requestedPage = parseRequestedPage(params);
  const qs = toQuery(params);
  const key = enabled ? `${BASE}${qs ? `?${qs}` : ''}` : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: InputDonasi[]; total: number; page: number; limit: number;
    footer: { total_nominal_donasi: number };
  }>(key, fetcher, LIST_SWR_OPTIONS);

  const responsePage = data?.page ?? 0;

  return {
    data:        data?.data ?? [],
    total:       data?.total ?? 0,
    footerTotal: data?.footer?.total_nominal_donasi ?? 0,
    page:        responsePage,
    requestedPage,
    isReady:     isListPageReady(requestedPage, responsePage, isLoading, isValidating),
    loading:     isLoading,
    isValidating,
    error,
    mutate,
  };
}

const LOOKUP_SWR = { revalidateOnFocus: false, dedupingInterval: 2_000 } as const;

export function useDonaturSearch(q: string) {
  const enabled = q.trim().length >= 2;
  const { data, isLoading } = useSWR<{ data: DonaturOption[] }>(
    enabled ? `${BASE}/lookup/donatur?q=${encodeURIComponent(q)}` : null,
    fetcher, LOOKUP_SWR,
  );
  return { rows: data?.data ?? [], loading: isLoading };
}

export function useAnakByDonatur(did: string, q: string) {
  const enabled = !!did;
  const { data, isLoading } = useSWR<{ data: AnakDonasiOption[] }>(
    enabled ? `${BASE}/lookup/anak?did=${encodeURIComponent(did)}&q=${encodeURIComponent(q)}` : null,
    fetcher, LOOKUP_SWR,
  );
  return { rows: data?.data ?? [], loading: isLoading };
}

export function useTransaksiByDonatur(did: string) {
  const enabled = !!did;
  const { data, isLoading } = useSWR<{ data: TransaksiDonasiOption[] }>(
    enabled ? `${BASE}/lookup/transaksi?did=${encodeURIComponent(did)}` : null,
    fetcher, LOOKUP_SWR,
  );
  return { rows: data?.data ?? [], loading: isLoading };
}
