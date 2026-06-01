'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ListQueryResult<T> {
  data:         T[];
  total:        number;
  page:         number;
  isReady:      boolean;
  isValidating: boolean;
  isLoading:    boolean;
}

interface UseMobileInfiniteListOptions<T> {
  enabled:     boolean;
  filtersKey:  string;
  getId:       (item: T) => string;
  query:       ListQueryResult<T>;
  currentPage: number;
  setPage:     (page: number | ((p: number) => number)) => void;
}

/**
 * Accumulates paginated API results for mobile infinite scroll.
 */
export function useMobileInfiniteList<T>({
  enabled,
  filtersKey,
  getId,
  query,
  currentPage,
  setPage,
}: UseMobileInfiniteListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastMergedPageRef = useRef(0);

  const { data, total, page: responsePage, isReady, isValidating, isLoading } = query;

  useEffect(() => {
    if (!enabled) return;
    setPage(1);
    setItems([]);
    setLoadingMore(false);
    lastMergedPageRef.current = 0;
  }, [filtersKey, enabled, setPage]);

  useEffect(() => {
    if (!enabled || !isReady || responsePage !== currentPage) return;
    if (lastMergedPageRef.current === currentPage) {
      setLoadingMore(false);
      return;
    }

    setItems(prev => {
      if (currentPage === 1) {
        lastMergedPageRef.current = 1;
        return data;
      }
      const seen = new Set(prev.map(getId));
      const added = data.filter(item => !seen.has(getId(item)));
      lastMergedPageRef.current = currentPage;
      return added.length > 0 ? [...prev, ...added] : prev;
    });
    setLoadingMore(false);
  }, [enabled, isReady, data, currentPage, responsePage, filtersKey, getId]);

  const hasMore = enabled && items.length < total;

  const loadMore = useCallback(() => {
    if (!enabled || loadingMore || isValidating || !hasMore) return;
    setLoadingMore(true);
    setPage(p => p + 1);
  }, [enabled, loadingMore, isValidating, hasMore, setPage]);

  return {
    items,
    total,
    hasMore,
    loadMore,
    isInitialLoading: enabled && isLoading && currentPage === 1 && items.length === 0,
    isLoadingMore: enabled && (loadingMore || isValidating) && currentPage > 1,
  };
}
