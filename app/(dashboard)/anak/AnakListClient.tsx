'use client';
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useAnakList } from '@/hooks/useAnakList';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useMobileInfiniteList } from '@/hooks/useMobileInfiniteList';
import { AnakFilter } from '@/components/anak/AnakFilter';
import { AnakTable } from '@/components/anak/AnakTable';
import { AnakCard } from '@/components/anak/AnakCard';
import { AnakProfileForm, BLANK_ANAK, type LockedScope } from '@/components/anak/AnakProfileForm';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { InfiniteScrollTrigger } from '@/components/ui/InfiniteScrollTrigger';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import type { AnakDetail } from '@/types/anak';

interface Props {
  lockedScope: LockedScope;
}

export function AnakListClient({ lockedScope }: Props) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [mobilePage, setMobilePage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const filtersKey = JSON.stringify(filters);
  const totalRef = useRef(0);

  const desktopList = useAnakList(
    { ...filters, page, limit },
    { enabled: !isMobile },
  );

  const mobileList = useAnakList(
    { ...filters, page: mobilePage, limit: DEFAULT_PAGE_SIZE },
    { enabled: isMobile },
  );

  const infinite = useMobileInfiniteList({
    enabled:    isMobile,
    filtersKey,
    getId:      r => r.id_anak,
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

  const handleLimitChange = (next: PageSizeOption) => {
    setLimit(next);
    setPage(1);
  };

  if (desktopList.isReady && desktopList.total > 0) {
    totalRef.current = desktopList.total;
  } else if (isMobile && infinite.total > 0) {
    totalRef.current = infinite.total;
  }

  const displayTotal = isMobile
    ? (infinite.total || totalRef.current)
    : (desktopList.isReady ? desktopList.total : totalRef.current);

  const rowOffsetDesktop = (page - 1) * limit;
  const desktopRows = desktopList.isReady ? desktopList.data : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Daftar Anak Asuh</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Total terdaftar: {displayTotal} Anak Asuh
            {isMobile && infinite.items.length > 0 && (
              <> · Ditampilkan {infinite.items.length}</>
            )}
          </p>
        </div>
        <Btn variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Tambah Anak
        </Btn>
      </div>

      <AnakFilter onFilterChange={handleFilterChange} />

      <div className="datagrid-desktop">
        <AnakTable
          data={desktopRows}
          loading={!desktopList.isReady}
          rowOffset={rowOffsetDesktop}
        />
      </div>

      <AnakCard
        data={isMobile ? infinite.items : desktopRows}
        rowOffset={0}
        loading={infinite.isInitialLoading}
      />

      {!isMobile && displayTotal > 0 && (
        <DesktopPagination
          page={page}
          limit={limit}
          total={displayTotal}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      )}

      {isMobile && (
        <InfiniteScrollTrigger
          onLoadMore={infinite.loadMore}
          hasMore={infinite.hasMore}
          loading={infinite.isInitialLoading || infinite.isLoadingMore}
        />
      )}

      {showCreate && (
        <Modal title="Tambah Anak" onClose={() => setShowCreate(false)} maxWidth={1040}>
          <AnakProfileForm
            anak={BLANK_ANAK}
            mode="create"
            lockedScope={lockedScope}
            onCancel={() => setShowCreate(false)}
            onSaved={(created: AnakDetail) => {
              setShowCreate(false);
              desktopList.mutate();
              mobileList.mutate();
              router.push(`/anak/${encodeURIComponent(created.id_anak)}`);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
