'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type {
  AnakKandidat, InputDonasi, KantorOption, ProgramOption, Transaksi,
} from '@/types/transaksi';

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

const BASE = '/api/anakjuara/transaksi';

/** Grid list for any of the four tabs. */
export function useTransaksiList(
  params: Record<string, string | number> = {},
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const requestedPage = parseRequestedPage(params);
  const qs = toQuery(params);
  const key = enabled ? `${BASE}${qs ? `?${qs}` : ''}` : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data:   Transaksi[];
    total:  number;
    page:   number;
    limit:  number;
    footer: { total_perkiraan_rp: number };
  }>(key, fetcher, LIST_SWR_OPTIONS);

  const responsePage = data?.page ?? 0;

  return {
    data:         data?.data ?? [],
    total:        data?.total ?? 0,
    footerTotal:  data?.footer?.total_perkiraan_rp ?? 0,
    page:         responsePage,
    requestedPage,
    isReady:      isListPageReady(requestedPage, responsePage, isLoading, isValidating),
    loading:      isLoading,
    isValidating,
    error,
    mutate,
  };
}

const DETAIL_SWR = {
  revalidateOnFocus: false,
  keepPreviousData:  false,
  dedupingInterval:  5_000,
} as const;

/** Saved splits for one transaction (Update Cashflow). */
export function useTransaksiEntries(
  transid: string | null,
  detailid: number | null,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false && !!transid && detailid !== null;
  const key = enabled
    ? `${BASE}/${encodeURIComponent(transid!)}/${detailid}/entries`
    : null;

  const { data, error, isLoading, mutate } = useSWR<{
    data: InputDonasi[];
    footer: { total_nominal_donasi: number; perkiraan_rp: number; selisih: number };
    transaksi: Transaksi;
  }>(key, fetcher, DETAIL_SWR);

  return { rows: data?.data ?? [], footer: data?.footer, loading: isLoading, error, mutate };
}

/** Eligible children for a fresh entry. */
export function useAnakKandidat(
  transid: string | null,
  detailid: number | null,
  qty: number,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false && !!transid && detailid !== null;
  const key = enabled
    ? `${BASE}/${encodeURIComponent(transid!)}/${detailid}/candidates?qty=${qty}`
    : null;

  const { data, error, isLoading } = useSWR<{
    data: AnakKandidat[];
    criteria: { id_donatur: string; program: string; tahun: string; qty: number };
  }>(key, fetcher, DETAIL_SWR);

  return {
    rows:     data?.data ?? [],
    criteria: data?.criteria,
    loading:  isLoading,
    error,
  };
}

/** Cached master dropdowns — one request for all three. */
export function useTransaksiOptions() {
  const { data, isLoading } = useSWR<{
    data: {
      kantor_ijis:      KantorOption[];
      kantor_transaksi: KantorOption[];
      program:          ProgramOption[];
    };
  }>(`${BASE}/options`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval:  3_600_000,
  });

  return {
    kantorIjis:      data?.data.kantor_ijis ?? [],
    kantorTransaksi: data?.data.kantor_transaksi ?? [],
    program:         data?.data.program ?? [],
    loading:         isLoading,
  };
}
