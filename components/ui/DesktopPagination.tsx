'use client';
import { Btn } from '@/components/ui/Btn';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

/**
 * Builds the numbered-page list for the pagination bar: always page 1 and
 * the last page, plus the current page ± 2 neighbors; any gap collapses
 * into a single non-interactive '…' entry.
 */
export function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 1) return [1];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  let prev: number | undefined;
  for (const p of sorted) {
    if (prev !== undefined && p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}

interface DesktopPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: PageSizeOption) => void;
}

export function DesktopPagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: DesktopPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(safePage * limit, total);

  return (
    <div
      className="pagination-desktop"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
        background: '#FFFFFF',
        padding: '10px 16px',
        borderRadius: 12,
        border: '1.5px solid #F2EAE3',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: '#7A6055' }}>
          Menampilkan <strong style={{ color: '#1A0A00' }}>{start}–{end}</strong> dari{' '}
          <strong style={{ color: '#1A0A00' }}>{total}</strong> data
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7A6055' }}>
          Baris per halaman
          <select
            value={limit}
            onChange={e => onLimitChange(Number(e.target.value) as PageSizeOption)}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1A0A00',
              border: '1.5px solid #F0C4A0',
              borderRadius: 8,
              padding: '5px 8px',
              background: '#FFFFFF',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Btn size="sm" disabled={safePage <= 1} onClick={() => onPageChange(1)}>
          <ChevronsLeft size={14} />
        </Btn>
        <Btn size="sm" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
          <ChevronLeft size={14} />
          <span>Sebelumnya</span>
        </Btn>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {buildPageList(safePage, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} style={{ fontSize: 12, color: '#7A6055', padding: '0 4px' }}>…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === safePage ? 'page' : undefined}
                style={{
                  minWidth: 28,
                  height: 28,
                  padding: '0 6px',
                  borderRadius: 8,
                  border: p === safePage ? '1.5px solid #BF4E02' : '1.5px solid #F0C4A0',
                  background: p === safePage ? '#BF4E02' : '#FFFFFF',
                  color: p === safePage ? '#FFFFFF' : '#1A0A00',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            )
          )}
        </div>
        <Btn size="sm" disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)}>
          <span>Berikutnya</span>
          <ChevronRight size={14} />
        </Btn>
        <Btn size="sm" disabled={safePage >= totalPages} onClick={() => onPageChange(totalPages)}>
          <ChevronsRight size={14} />
        </Btn>
      </div>
    </div>
  );
}
