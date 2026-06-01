'use client';
import useSWR from 'swr';
import type { HafalanItem } from '@/types/hafalan';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useHafalanChecklist(idAnak: string, semester: string) {
  const { data, error, mutate } = useSWR<{ data: HafalanItem[] }>(
    idAnak && semester ? `/api/anakjuara/anak/${idAnak}/hafalan?semester=${semester}` : null,
    fetcher,
  );

  return {
    items:   data?.data ?? [],
    loading: !data && !error,
    error,
    mutate,
  };
}

export function useHafalanMaster() {
  const { data, error } = useSWR<{ data: HafalanItem[] }>(
    '/api/anakjuara/hafalan/items',
    fetcher,
  );

  return {
    items:   data?.data ?? [],
    loading: !data && !error,
    error,
  };
}
