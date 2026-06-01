'use client';
import { Btn } from '@/components/ui/Btn';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

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
        <span style={{ fontSize: 12, color: '#7A6055', marginRight: 4 }}>
          Halaman <strong style={{ color: '#1A0A00' }}>{safePage}</strong> / {totalPages}
        </span>
        <Btn size="sm" disabled={safePage <= 1} onClick={() => onPageChange(1)}>
          <ChevronsLeft size={14} />
        </Btn>
        <Btn size="sm" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
          <ChevronLeft size={14} />
          <span>Sebelumnya</span>
        </Btn>
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
