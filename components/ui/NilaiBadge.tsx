'use client';
import { NILAI_COLOR } from '@/lib/utils';

export function NilaiBadge({ nilai }: { nilai?: string | null }) {
  const c = nilai ? (NILAI_COLOR[nilai] || '#7A6055') : '#7A6055';
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: c + '22', color: c, border: `1px solid ${c}40`, whiteSpace: 'nowrap',
    }}>
      {nilai || '—'}
    </span>
  );
}
