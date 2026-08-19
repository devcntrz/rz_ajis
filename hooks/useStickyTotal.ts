'use client';
import { useState } from 'react';

/**
 * Keeps the last confirmed row count while a new page is in flight.
 *
 * Without it the header count drops to 0 on every page change and flickers back. This
 * uses React's supported "adjust state during render" pattern rather than a ref, so the
 * value participates in rendering instead of being read out of band.
 */
export function useStickyTotal(total: number, isReady: boolean): number {
  const [sticky, setSticky] = useState(0);

  if (isReady && total !== sticky) {
    setSticky(total);
    return total;
  }

  return isReady ? total : sticky;
}
