'use client';
import { useState } from 'react';
import { TabBar } from '@/components/ui/TabBar';
import { WilayahTab } from '@/components/penyaluran/WilayahTab';
import { AnakTab } from '@/components/penyaluran/AnakTab';

const T = { charcoal: '#1A0A00', gray: '#7A6055' };

const TABS = [
  { id: 'wilayah', label: 'Wilayah' },
  { id: 'anak', label: 'Anak' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function PenyaluranClient() {
  const [tab, setTab] = useState<TabId>('wilayah');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.charcoal }}>Penyaluran</h2>
        <p style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
          Penyaluran beasiswa ke Anak Juara per batch (wilayah × bulan)
        </p>
      </div>

      <TabBar tabs={TABS as unknown as { id: string; label: string }[]} active={tab} onChange={id => setTab(id as TabId)} />

      {tab === 'wilayah' && <WilayahTab />}
      {tab === 'anak' && <AnakTab />}
    </div>
  );
}
