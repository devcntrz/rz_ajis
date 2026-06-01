'use client';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { Btn } from '@/components/ui/Btn';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AnakFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function AnakFilter({ onFilterChange }: AnakFilterProps) {
  const [q, setQ] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [statusOrtu, setStatusOrtu] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [asnaf, setAsnaf] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Fetch active regions for dropdown
  const { data: wilayahRes } = useSWR<{ data: Array<{ id_wilayah_pembinaan: number; nama_wilayah: string }> }>(
    '/api/anakjuara/wilayah',
    fetcher,
  );
  const wilayahList = wilayahRes?.data ?? [];
  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onFilterChangeRef.current({ q, wilayah, status_ortu: statusOrtu, jenjang, asnaf });
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [q, wilayah, statusOrtu, jenjang, asnaf]);

  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
      padding: '14px 18px', marginBottom: 18,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#7A6055" style={{ position: 'absolute', left: 11, top: 11 }} />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cari nama, ID anak, atau panggilan..."
            style={{ paddingLeft: 34 }}
          />
        </div>
        <Btn onClick={() => setExpanded(!expanded)} variant="outline" style={{ height: 38 }}>
          <SlidersHorizontal size={15} />
          <span>Filter</span>
        </Btn>
      </div>

      {expanded && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid #F2EAE3',
        }}>
          <div>
            <FLabel>Wilayah</FLabel>
            <Sel value={wilayah} onChange={e => setWilayah(e.target.value)}>
              <option value="">Semua Wilayah</option>
              {wilayahList.map(w => (
                <option key={w.id_wilayah_pembinaan} value={String(w.id_wilayah_pembinaan)}>
                  {w.nama_wilayah}
                </option>
              ))}
            </Sel>
          </div>

          <div>
            <FLabel>Status Ortu</FLabel>
            <Sel value={statusOrtu} onChange={e => setStatusOrtu(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="yatim">Yatim</option>
              <option value="piatu">Piatu</option>
              <option value="yatim piatu">Yatim Piatu</option>
              <option value="dhuafa">Dhuafa</option>
            </Sel>
          </div>

          <div>
            <FLabel>Jenjang</FLabel>
            <Sel value={jenjang} onChange={e => setJenjang(e.target.value)}>
              <option value="">Semua Jenjang</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="PT">Perguruan Tinggi</option>
            </Sel>
          </div>

          <div>
            <FLabel>Asnaf</FLabel>
            <Sel value={asnaf} onChange={e => setAsnaf(e.target.value)}>
              <option value="">Semua Asnaf</option>
              <option value="Fakir">Fakir</option>
              <option value="Miskin">Miskin</option>
              <option value="Yatim">Yatim</option>
              <option value="Fisabilillah">Fisabilillah</option>
            </Sel>
          </div>
        </div>
      )}
    </div>
  );
}
