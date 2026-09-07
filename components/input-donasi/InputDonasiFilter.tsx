'use client';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';

const T = { primarySoft: '#F0C4A0', primaryPale: '#FBF0E8', white: '#FFFFFF' };

export type Filters = Record<string, string>;

interface Props {
  value:   Filters;
  onApply: (next: Filters) => void;
}

export function InputDonasiFilter({ value, onApply }: Props) {
  const [draft, setDraft] = useState<Filters>(value);
  const set = (k: string, v: string) => setDraft(d => ({ ...d, [k]: v }));

  const apply = () => {
    const cleaned: Filters = {};
    Object.entries(draft).forEach(([k, v]) => { if (v !== '') cleaned[k] = v; });
    onApply(cleaned);
  };
  const reset = () => { setDraft({}); onApply({}); };
  const activeCount = Object.values(draft).filter(v => v !== '').length;

  return (
    <div style={{
      background: T.white, border: `1.5px solid ${T.primarySoft}`,
      borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 220px', minWidth: 200 }}>
          <FLabel>Kata kunci</FLabel>
          <Input
            value={draft.q ?? ''}
            onChange={e => set('q', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') apply(); }}
            placeholder="Nama anak, donatur, transid, kantor…"
          />
        </div>
        <div style={{ flex: '1 1 130px', minWidth: 120 }}>
          <FLabel>Jenis</FLabel>
          <Sel value={draft.jenis ?? ''} onChange={e => set('jenis', e.target.value)}>
            <option value="">Semua</option>
            <option value="trans">Transaksi</option>
            <option value="saldo">Saldo</option>
          </Sel>
        </div>
        <div style={{ flex: '1 1 110px', minWidth: 100 }}>
          <FLabel>Bulan</FLabel>
          <Sel value={draft.bulan ?? ''} onChange={e => set('bulan', e.target.value)}>
            <option value="">Semua</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
              <option key={b} value={String(b)}>{b}</option>
            ))}
          </Sel>
        </div>
        <div style={{ flex: '1 1 110px', minWidth: 100 }}>
          <FLabel>Tahun</FLabel>
          <Input type="number" value={draft.tahun ?? ''} onChange={e => set('tahun', e.target.value)} placeholder="cth. 2026" />
        </div>
        <div style={{ flex: '1 1 150px', minWidth: 130 }}>
          <FLabel>Kategori program</FLabel>
          <Input value={draft.kategori ?? ''} onChange={e => set('kategori', e.target.value)} placeholder="cth. Juara" />
        </div>
        <div style={{ flex: '1 1 140px', minWidth: 130 }}>
          <FLabel>Dari</FLabel>
          <Input type="date" value={draft.tgl_awal ?? ''} onChange={e => set('tgl_awal', e.target.value)} />
        </div>
        <div style={{ flex: '1 1 140px', minWidth: 130 }}>
          <FLabel>Sampai</FLabel>
          <Input type="date" value={draft.tgl_akhir ?? ''} onChange={e => set('tgl_akhir', e.target.value)} />
        </div>
        <Btn variant="primary" onClick={apply}><Search size={15} /> Cari</Btn>
        {activeCount > 0 && (
          <Btn variant="ghost" onClick={reset}><X size={15} /> Reset</Btn>
        )}
      </div>
    </div>
  );
}
