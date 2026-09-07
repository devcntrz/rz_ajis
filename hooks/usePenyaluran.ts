'use client';
import useSWR from 'swr';
import { isListPageReady, parseRequestedPage } from '@/lib/pagination';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type { KandidatSalur, KantorOption, PenyaluranBatch, PenyaluranRow, SdmOption, WilayahOption } from '@/types/penyaluran';

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

const BASE = '/api/anakjuara/penyaluran';

export function useBatchList(params: Record<string, string | number> = {}, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const requestedPage = parseRequestedPage(params);
  const qs = toQuery(params);
  const key = enabled ? `${BASE}${qs ? `?${qs}` : ''}` : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: PenyaluranBatch[]; total: number; page: number; limit: number;
  }>(key, fetcher, LIST_SWR_OPTIONS);

  const responsePage = data?.page ?? 0;

  return {
    data: data?.data ?? [], total: data?.total ?? 0, page: responsePage, requestedPage,
    isReady: isListPageReady(requestedPage, responsePage, isLoading, isValidating),
    loading: isLoading, isValidating, error, mutate,
  };
}

export function useAnakGridList(params: Record<string, string | number> = {}, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const requestedPage = parseRequestedPage(params);
  const qs = toQuery(params);
  const key = enabled ? `${BASE}/anak${qs ? `?${qs}` : ''}` : null;

  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: PenyaluranRow[]; total: number; page: number; limit: number;
  }>(key, fetcher, LIST_SWR_OPTIONS);

  const responsePage = data?.page ?? 0;

  return {
    data: data?.data ?? [], total: data?.total ?? 0, page: responsePage, requestedPage,
    isReady: isListPageReady(requestedPage, responsePage, isLoading, isValidating),
    loading: isLoading, isValidating, error, mutate,
  };
}

export function useBatchDetail(idPenyaluran: string | null) {
  const key = idPenyaluran ? `${BASE}/${encodeURIComponent(idPenyaluran)}` : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: PenyaluranRow[] }>(
    key, fetcher, { revalidateOnFocus: false, dedupingInterval: 3_000 },
  );
  return { rows: data?.data ?? [], loading: isLoading, error, mutate };
}

export function useKandidat(params: {
  kantorId?: string; wilayahId?: string; tahun?: number; bulan?: number; q?: string; limit?: number;
}, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false && !!params.wilayahId && !!params.tahun && !!params.bulan;
  const qs = toQuery(params);
  const key = enabled ? `${BASE}/kandidat?${qs}` : null;
  const { data, error, isLoading, mutate } = useSWR<{ data: KandidatSalur[] }>(
    key, fetcher, { revalidateOnFocus: false, dedupingInterval: 3_000 },
  );
  return { rows: data?.data ?? [], loading: isLoading, error, mutate };
}

export function usePenyaluranLookup() {
  const { data, isLoading } = useSWR<{ data: { kantor: KantorOption[]; wilayah: WilayahOption[] } }>(
    `${BASE}/lookup`, fetcher, { revalidateOnFocus: false, dedupingInterval: 3_600_000 },
  );
  return { kantor: data?.data.kantor ?? [], wilayah: data?.data.wilayah ?? [], loading: isLoading };
}

export function useSdmSearch(q: string) {
  const enabled = q.trim().length >= 2;
  const { data, isLoading } = useSWR<{ data: SdmOption[] }>(
    enabled ? `${BASE}/lookup?sdm_q=${encodeURIComponent(q)}` : null,
    fetcher, { revalidateOnFocus: false, dedupingInterval: 2_000 },
  );
  return { rows: data?.data ?? [], loading: isLoading };
}
