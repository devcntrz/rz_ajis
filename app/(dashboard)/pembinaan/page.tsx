'use client';
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePembinaanList } from '@/hooks/usePembinaan';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useMobileInfiniteList } from '@/hooks/useMobileInfiniteList';
import { PembinaanFilter } from '@/components/pembinaan/PembinaanFilter';
import { PembinaanTable } from '@/components/pembinaan/PembinaanTable';
import { PembinaanCard } from '@/components/pembinaan/PembinaanCard';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { InfiniteScrollTrigger } from '@/components/ui/InfiniteScrollTrigger';
import { Btn } from '@/components/ui/Btn';
import { Plus } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';

export default function PembinaanListPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [mobilePage, setMobilePage] = useState(1);
  const filtersKey = JSON.stringify(filters);
  const totalRef = useRef(0);

  const desktopList = usePembinaanList(
    { ...filters, page, limit },
    { enabled: !isMobile },
  );

  const mobileList = usePembinaanList(
    { ...filters, page: mobilePage, limit: DEFAULT_PAGE_SIZE },
    { enabled: isMobile },
  );

  const infinite = useMobileInfiniteList({
    enabled:    isMobile,
    filtersKey,
    getId:      r => r.id_pembinaan,
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
      return newFilters;
    });
  }, []);

  const rowOffsetDesktop = (page - 1) * limit;
  const desktopRows = desktopList.isReady ? desktopList.data : [];

  if (desktopList.isReady && desktopList.total > 0) {
    totalRef.current = desktopList.total;
  } else if (isMobile && infinite.total > 0) {
    totalRef.current = infinite.total;
  }

  const displayTotal = isMobile
    ? (infinite.total || totalRef.current)
    : (desktopList.isReady ? desktopList.total : totalRef.current);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

      <PembinaanFilter onFilterChange={handleFilterChange} />

      <div className="datagrid-desktop">
        <PembinaanTable
          data={desktopRows}
          loading={!desktopList.isReady}
          rowOffset={rowOffsetDesktop}
        />
      </div>

      <PembinaanCard data={isMobile ? infinite.items : desktopRows} />

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
