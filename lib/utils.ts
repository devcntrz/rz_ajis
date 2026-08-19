/**
 * lib/utils.ts — Shared utilities
 */
import type { NilaiHuruf } from '@/types/penilaian';

/** Convert percentage score to evaluation grade */
export function scoreToNilai(pct: number): NilaiHuruf {
  if (pct >= 90) return 'Excellent';
  if (pct >= 75) return 'Good';
  if (pct >= 55) return 'Average';
  if (pct >= 35) return 'Below Average';
  return 'Poor';
}

/** Format date to Indonesian locale (e.g. "15 Jan 2026") */
export function fmtTgl(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const RP = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** Thousand-separated rupiah amount, without the "Rp" prefix. */
export function fmtRp(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? RP.format(Math.round(n)) : '0';
}

/** Calculate age from birth date */
export function calcAge(tglLahir: string | Date | null | undefined): number {
  if (!tglLahir) return 0;
  const d = new Date(tglLahir);
  const now = new Date();
  let y = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) y--;
  return y;
}

/** Generate initials from name (max 2 words) */
export function inits(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

/** Debounce helper for search inputs */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

/** Nilai grade colors matching design tokens */
export const NILAI_COLOR: Record<string, string> = {
  Excellent:       '#1A7A45',
  Good:            '#2E8B57',
  Average:         '#B87800',
  'Below Average': '#B02020',
  Poor:            '#7A0000',
};

/** Status ortu color map [textColor, bgColor] */
export const STATUS_COLOR: Record<string, [string, string]> = {
  yatim:        ['#1A5FA8', '#E5EEF8'],
  'yatim piatu':['#B87800', '#FDF4DC'],
  dhuafa:       ['#7A6055', '#F2EAE3'],
  Yatim:        ['#1A5FA8', '#E5EEF8'],
  'Yatim Piatu':['#B87800', '#FDF4DC'],
  Dhuafa:       ['#7A6055', '#F2EAE3'],
};

/** Kehadiran status color map */
export const HADIR_COLOR: Record<string, [string, string]> = {
  hadir: ['#1A7A45', '#E5F5ED'],
  y:     ['#1A7A45', '#E5F5ED'],
  izin:  ['#1A5FA8', '#E5EEF8'],
  alfa:  ['#B02020', '#FDEAEA'],
  n:     ['#B02020', '#FDEAEA'],
  sakit: ['#B87800', '#FDF4DC'],
};

/** NILAI_OPTIONS list */
export const NILAI_OPTIONS: NilaiHuruf[] = [
  'Excellent', 'Good', 'Average', 'Below Average', 'Poor',
];
