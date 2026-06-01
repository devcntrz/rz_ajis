'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePembinaanList } from '@/hooks/usePembinaan';
import { PembinaanFilter } from '@/components/pembinaan/PembinaanFilter';
import { PembinaanTable } from '@/components/pembinaan/PembinaanTable';
import { PembinaanCard } from '@/components/pembinaan/PembinaanCard';
import { Btn } from '@/components/ui/Btn';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PembinaanListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, total, loading } = usePembinaanList({ ...filters, page, limit });

  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1); // Reset page on filter change
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Sesi Pembinaan</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola log kehadiran dan pembiasaan mandiri anak asuh
          </p>
        </div>
        <Btn onClick={() => router.push('/pembinaan/new')} variant="primary" style={{ padding: '8px 16px' }}>
          <Plus size={16} />
          <span>Sesi Baru</span>
        </Btn>
      </div>

      {/* Filters Bar */}
      <PembinaanFilter onFilterChange={handleFilterChange} />

      {/* Grid: Desktop Table + Mobile Cards */}
      <div className="datagrid-desktop">
        <PembinaanTable data={data} loading={loading} />
      </div>

      <PembinaanCard data={data} />

      {/* Pagination */}
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
