'use client';
import { useState } from 'react';
import { useAnakList } from '@/hooks/useAnakList';
import { AnakFilter } from '@/components/anak/AnakFilter';
import { AnakTable } from '@/components/anak/AnakTable';
import { AnakCard } from '@/components/anak/AnakCard';
import { Btn } from '@/components/ui/Btn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AnakListPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, total, loading } = useAnakList({ ...filters, page, limit });

  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Daftar Anak Asuh</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Total terdaftar: {total} Anak Asuh
          </p>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnakFilter onFilterChange={handleFilterChange} />

      {/* Grid: Desktop Table + Mobile Cards */}
      <div className="datagrid-desktop">
        <AnakTable data={data} loading={loading} />
      </div>

      <AnakCard data={data} />

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 10, background: '#FFFFFF', padding: '10px 16px',
          borderRadius: 12, border: '1.5px solid #F2EAE3',
        }}>
          <span style={{ fontSize: 12, color: '#7A6055' }}>
            Halaman {page} dari {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              size="sm"
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </Btn>
            <Btn
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              size="sm"
            >
              <span>Berikutnya</span>
              <ChevronRight size={14} />
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
