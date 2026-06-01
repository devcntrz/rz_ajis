'use client';
import { useEffect, useState } from 'react';
import type { SemesterOption } from '@/types/semester';

export function useCurrentSemester(enabled = true) {
  const [current, setCurrent] = useState<SemesterOption | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch('/api/anakjuara/semester?limit=10')
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        const list = (json.data ?? []) as SemesterOption[];
        const active = list.find(s => s.is_current) ?? list[0] ?? null;
        setCurrent(active);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled]);

  return { current, loading };
}
