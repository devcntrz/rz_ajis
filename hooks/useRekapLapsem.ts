'use client';
import useSWR from 'swr';
import { LIST_SWR_OPTIONS } from '@/lib/swrConfig';
import type { RekapKantorRow } from '@/types/laporan-semester';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useRekapLapsem(semesterid: string, jenisLaporan = 'reguler') {
  const key = semesterid
    ? `/api/anakjuara/laporan-semester/rekap?semesterid=${encodeURIComponent(semesterid)}&jenis_laporan=${encodeURIComponent(jenisLaporan)}`
    : null;

  const { data, error, mutate, isLoading } = useSWR<{
    data: RekapKantorRow[];
    error?: string;
  }>(key, fetcher, LIST_SWR_OPTIONS);

  return {
    data:    data?.data ?? [],
    loading: isLoading,
    error:   data?.error || error,
    mutate,
  };
}
