'use client';
import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
}

export function InfiniteScrollTrigger({ onLoadMore, hasMore, loading }: InfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting || loading) return;
        onLoadMoreRef.current();
      },
      { rootMargin: '100px', threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  if (!hasMore && !loading) {
    return (
      <div
        className="pagination-mobile-only"
        style={{ padding: '12px 0', textAlign: 'center', fontSize: 12, color: '#7A6055' }}
      >
        Semua data sudah dimuat
      </div>
    );
  }

  return (
    <div
      ref={sentinelRef}
      className="pagination-mobile-only"
      style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: '#7A6055', minHeight: 40 }}
    >
      {loading ? 'Memuat data...' : 'Gulir untuk memuat lebih banyak'}
    </div>
  );
}
