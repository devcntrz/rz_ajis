'use client';
import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { useAnakJuara } from '@/hooks/useAnakJuara';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useMobileInfiniteList } from '@/hooks/useMobileInfiniteList';
import { AnakJuaraFilter } from '@/components/anak-juara/AnakJuaraFilter';
import { AnakJuaraTable } from '@/components/anak-juara/AnakJuaraTable';
import { AnakJuaraCard } from '@/components/anak-juara/AnakJuaraCard';
import { AjuanGantiAnakForm } from '@/components/anak-juara/AjuanGantiAnakForm';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { InfiniteScrollTrigger } from '@/components/ui/InfiniteScrollTrigger';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import { filtersToQuery } from '@/lib/excel';
import type { AnakJuaraRow } from '@/types/anak-juara';

interface Props {
  idGroupUser: number;
}

export function AnakJuaraClient({ idGroupUser }: Props) {
  const isMobile = useIsMobile();
  const currentYear = String(new Date().getFullYear());
  const [filters, setFilters] = useState<Record<string, string>>({
    tahun: currentYear,
    status_pasangan: 'y',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [mobilePage, setMobilePage] = useState(1);
  const [selected, setSelected] = useState<AnakJuaraRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [exporting, setExporting] = useState(false);
  const [sortBy, setSortBy] = useState('nama_anak');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const filtersKey = JSON.stringify({ ...filters, sortBy, sortDir });
  const totalRef = useRef(0);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
    setPage(1);
    setMobilePage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const qs = filtersToQuery(filters);
      const res = await fetch(`/api/anakjuara/anak-juara/export${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || 'Gagal export Excel.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anak-juara-${filters.tahun || 'export'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal export Excel.');
    } finally {
      setExporting(false);
    }
  };

  const desktopList = useAnakJuara(
    { ...filters, page, limit, sort: sortBy, order: sortDir },
    { enabled: !isMobile },
  );

  const mobileList = useAnakJuara(
    { ...filters, page: mobilePage, limit: DEFAULT_PAGE_SIZE, sort: sortBy, order: sortDir },
    { enabled: isMobile },
  );

  const infinite = useMobileInfiniteList({
    enabled: isMobile,
    filtersKey,
    getId: r => r.id_pemasangan_baru,
    query: {
      data:         mobileList.data,
      total:        mobileList.total,
      page:         mobileList.page,
      isReady:      mobileList.isReady,
      isValidating: mobileList.isValidating,
      isLoading:    mobileList.loading,
    },
    currentPage: mobilePage,
    setPage:     setMobilePage,
  });

  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(prev => {
      if (filtersAreEqual(prev, newFilters)) return prev;
      setPage(1);
      setMobilePage(1);
      setSelected(null);
      return newFilters;
    });
  }, []);

  if (desktopList.isReady && desktopList.total > 0) {
    totalRef.current = desktopList.total;
  } else if (isMobile && infinite.total > 0) {
    totalRef.current = infinite.total;
  }

  const displayTotal = isMobile
    ? (infinite.total || totalRef.current)
    : (desktopList.isReady ? desktopList.total : totalRef.current);

  const desktopRows = desktopList.isReady ? desktopList.data : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Anak Juara</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Total pemasangan: {displayTotal}
            {isMobile && infinite.items.length > 0 && (
              <> · Ditampilkan {infinite.items.length}</>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn variant="outline" onClick={handleExport} disabled={exporting}>
            <Download size={16} />
            {exporting ? 'Export...' : 'Export Excel'}
          </Btn>
          <Btn
            variant="primary"
            disabled={!selected}
            onClick={() => selected && setShowForm(true)}
          >
            <Plus size={16} />
            Ajuan Ganti Anak
          </Btn>
        </div>
      </div>

      {toast && (
        <div style={{
          background: '#E5F5ED', color: '#1A7A45', borderRadius: 10,
          padding: '10px 14px', fontSize: 13, fontWeight: 600,
        }}>
          {toast}{' '}
          <Link href="/ajuan-pergantian" style={{ color: '#BF4E02', fontWeight: 800 }}>
            Buka List Ajuan Pergantian →
          </Link>
        </div>
      )}

      {selected && (
        <div style={{
          fontSize: 12, color: '#1A7A45', background: '#E5F5ED',
          border: '1px solid #1A7A4540', borderRadius: 10, padding: '8px 12px',
        }}>
          Terpilih: <strong>{selected.nama_anak}</strong> · {selected.id_anak} · Donatur {selected.nama_donatur}
        </div>
      )}

      <AnakJuaraFilter onFilterChange={handleFilterChange} idGroupUser={idGroupUser} />

      <div className="datagrid-desktop">
        <AnakJuaraTable
          data={desktopRows}
          loading={!desktopList.isReady}
          rowOffset={(page - 1) * limit}
          selectedId={selected?.id_pemasangan_baru}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onSelect={setSelected}
        />
      </div>

      <AnakJuaraCard
        data={isMobile ? infinite.items : desktopRows}
        loading={infinite.isInitialLoading}
        selectedId={selected?.id_pemasangan_baru}
        onSelect={setSelected}
      />

      {!isMobile && displayTotal > 0 && (
        <DesktopPagination
          page={page}
          limit={limit}
          total={displayTotal}
          onPageChange={setPage}
          onLimitChange={next => { setLimit(next); setPage(1); }}
        />
      )}

      {isMobile && (
        <InfiniteScrollTrigger
          onLoadMore={infinite.loadMore}
          hasMore={infinite.hasMore}
          loading={infinite.isInitialLoading || infinite.isLoadingMore}
        />
      )}

      {showForm && selected && (
        <AjuanGantiAnakForm
          row={selected}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setToast('Ajuan berhasil disimpan.');
            desktopList.mutate();
            mobileList.mutate();
          }}
        />
      )}
    </div>
  );
}
