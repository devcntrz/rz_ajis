'use client';
import useSWR from 'swr';
import type { PenilaianSummary } from '@/types/penilaian';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePenilaianList(params: { semester?: string; wilayah?: string; q?: string; status?: string } = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) query.append(k, v);
  });

  const queryString = query.toString();
  const { data, error, mutate } = useSWR<{ data: Array<{ id_anak: string; nama_lengkap: string; jenjang_pendidikan: string; nama_wilayah: string; nama_kantor: string; record_count: number; nilai_capaian_avg: number }> }>(
    `/api/anakjuara/penilaian${queryString ? `?${queryString}` : ''}`,
    fetcher,
    { keepPreviousData: true },
  );

  return {
    data:    data?.data ?? [],
    loading: !data && !error,
    error,
    mutate,
  };
}

export function usePenilaianDetail(anakId: string, semester: string) {
  const { data, error, mutate } = useSWR<{ data: PenilaianSummary & { nama_wilayah: string; nama_kantor: string; has_data: boolean } }>(
    anakId && semester ? `/api/anakjuara/penilaian/${anakId}/${semester}` : null,
    fetcher,
  );

  return {
    detail:  data?.data ?? null,
    loading: !data && !error,
    error,
    mutate,
  };
}
