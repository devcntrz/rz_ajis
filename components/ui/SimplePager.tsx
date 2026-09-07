'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';

/**
 * Prev/Next pager for grids that deliberately skip an exact COUNT (see
 * lib/penyaluran/queries.ts) — the server reports `hasMore` from a limit+1 fetch
 * instead of a total row count.
 */
interface Props {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  shownCount: number;
}

export function SimplePager({ page, hasMore, onPageChange, shownCount }: Props) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      flexWrap: 'wrap', background: '#FFFFFF', padding: '10px 16px',
      borderRadius: 12, border: '1.5px solid #F2EAE3',
    }}>
      <span style={{ fontSize: 12, color: '#7A6055' }}>
        Halaman <strong style={{ color: '#1A0A00' }}>{page}</strong> · {shownCount} baris ditampilkan
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={14} /> Sebelumnya
        </Btn>
        <Btn size="sm" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
          Berikutnya <ChevronRight size={14} />
        </Btn>
      </div>
    </div>
  );
}
