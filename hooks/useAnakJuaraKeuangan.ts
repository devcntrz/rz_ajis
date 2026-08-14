'use client';
import useSWR from 'swr';
import type { KeuanganPivot } from '@/lib/keuangan';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/**
 * Jan–Des finance pivot for the rows currently on screen (PRD §9.4).
 * Kept separate from the list query so the identity grid paints immediately and the
 * money columns fill in a moment later, instead of every page load waiting on
 * three aggregates.
 */
export function useAnakJuaraKeuangan(ids: string[]) {
  const key = ids.length > 0
    ? `/api/anakjuara/anak-juara/keuangan?ids=${encodeURIComponent(ids.join(','))}`
    : null;

  const { data, isLoading } = useSWR<{ data: Record<string, KeuanganPivot> }>(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 30_000,
  });

  return {
    keuangan: data?.data ?? {},
    loading: !!key && isLoading,
  };
}
