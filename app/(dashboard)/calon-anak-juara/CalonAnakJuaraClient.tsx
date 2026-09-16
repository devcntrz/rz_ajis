'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useCalonAnakJuara } from '@/hooks/useCalonAnakJuara';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useMobileInfiniteList } from '@/hooks/useMobileInfiniteList';
import { CalonAnakJuaraFilter } from '@/components/calon-anak-juara/CalonAnakJuaraFilter';
import { CalonAnakJuaraTable } from '@/components/calon-anak-juara/CalonAnakJuaraTable';
import { CalonAnakJuaraCard } from '@/components/calon-anak-juara/CalonAnakJuaraCard';
import { PasangDonaturForm, type PasangAnakTarget } from '@/components/calon-anak-juara/PasangDonaturForm';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { InfiniteScrollTrigger } from '@/components/ui/InfiniteScrollTrigger';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import type { CalonAnakJuaraRow } from '@/types/calon-anak-juara';

interface Props {
  idGroupUser: number;
}

export function CalonAnakJuaraClient({ idGroupUser }: Props) {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [mobilePage, setMobilePage] = useState(1);
  const [pasangTarget, setPasangTarget] = useState<PasangAnakTarget | null>(null);
  const filtersKey = JSON.stringify(filters);
  const totalRef = useRef(0);

  const desktopList = useCalonAnakJuara(
    { ...filters, page, limit },
    { enabled: !isMobile },
  );

  const mobileList = useCalonAnakJuara(
    { ...filters, page: mobilePage, limit: DEFAULT_PAGE_SIZE },
    { enabled: isMobile },
  );

  const infinite = useMobileInfiniteList({
    enabled: isMobile,
    filtersKey,
    getId: r => r.id_anak,
    query: {
      data: mobileList.data,
      total: mobileList.total,
      page: mobileList.page,
      isReady: mobileList.isReady,
      isValidating: mobileList.isValidating,
      isLoading: mobileList.loading,
    },
    currentPage: mobilePage,
    setPage: setMobilePage,
  });

  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(prev => {
      if (filtersAreEqual(prev, newFilters)) return prev;
      setPage(1);
      setMobilePage(1);
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

  const desktopRows = useMemo(
    () => (desktopList.isReady ? desktopList.data : []),
    [desktopList.isReady, desktopList.data],
  );

  const handlePdf = (row: CalonAnakJuaraRow, kind: 'pdf-surat' | 'pdf-cv') => {
    window.open(
      `/api/anakjuara/calon-anak-juara/${encodeURIComponent(row.id_anak)}/${kind}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handlePasangDonatur = (row: CalonAnakJuaraRow) => {
    setPasangTarget({ id_anak: row.id_anak, nama_anak: row.nama_lengkap, nama_kantor: row.nama_kantor });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Calon Anak Juara</h2>
        <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
          Total: {displayTotal}
          {isMobile && infinite.items.length > 0 && (
            <> · Ditampilkan {infinite.items.length}</>
          )}
        </p>
      </div>

      <CalonAnakJuaraFilter onFilterChange={handleFilterChange} idGroupUser={idGroupUser} />

      <div className="datagrid-desktop">
        <CalonAnakJuaraTable
          data={desktopRows}
          loading={!desktopList.isReady}
          rowOffset={(page - 1) * limit}
          onPdfSurat={r => handlePdf(r, 'pdf-surat')}
          onPdfCv={r => handlePdf(r, 'pdf-cv')}
          onPasangDonatur={handlePasangDonatur}
        />
      </div>

      <CalonAnakJuaraCard
        data={isMobile ? infinite.items : desktopRows}
        loading={infinite.isInitialLoading}
        onPdfSurat={r => handlePdf(r, 'pdf-surat')}
        onPdfCv={r => handlePdf(r, 'pdf-cv')}
        onPasangDonatur={handlePasangDonatur}
      />

      {pasangTarget && (
        <PasangDonaturForm
          anak={pasangTarget}
          onClose={() => setPasangTarget(null)}
          onSuccess={() => {
            setPasangTarget(null);
            desktopList.mutate();
            mobileList.mutate();
          }}
        />
      )}

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
    </div>
  );
}
