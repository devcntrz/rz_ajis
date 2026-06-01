'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { Btn } from '@/components/ui/Btn';

interface PembinaanFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function PembinaanFilter({ onFilterChange }: PembinaanFilterProps) {
  const [q, setQ] = useState('');
  const [jenis, setJenis] = useState('');
  const [semester, setSemester] = useState('');
  const [tglDari, setTglDari] = useState('');
  const [tglSampai, setTglSampai] = useState('');
  const [expanded, setExpanded] = useState(false);

  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onFilterChangeRef.current({ q, jenis, semester, tgl_dari: tglDari, tgl_sampai: tglSampai });
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [q, jenis, semester, tglDari, tglSampai]);

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
            placeholder="Cari tema / materi pembinaan..."
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
            <FLabel>Jenis Pembinaan</FLabel>
            <Sel value={jenis} onChange={e => setJenis(e.target.value)}>
              <option value="">Semua Jenis</option>
              <option value="Pembinaan Wilayah">Pembinaan Wilayah</option>
              <option value="Pekan Berbagi Senyum">Pekan Berbagi Senyum</option>
              <option value="Mentoring Online">Mentoring Online</option>
            </Sel>
          </div>

          <div>
            <FLabel>Semester</FLabel>
            <Sel value={semester} onChange={e => setSemester(e.target.value)}>
              <option value="">Semua Semester</option>
              <option value="25">Semester Ganjil 2025/2026</option>
              <option value="26">Semester Genap 2025/2026</option>
            </Sel>
          </div>

          <div>
            <FLabel>Dari Tanggal</FLabel>
            <Input type="date" value={tglDari} onChange={e => setTglDari(e.target.value)} />
          </div>

          <div>
            <FLabel>Sampai Tanggal</FLabel>
            <Input type="date" value={tglSampai} onChange={e => setTglSampai(e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
