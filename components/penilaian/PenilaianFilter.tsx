'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search } from 'lucide-react';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PenilaianFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
  semester:       string;
  setSemester:    (s: string) => void;
}

export function PenilaianFilter({ onFilterChange, semester, setSemester }: PenilaianFilterProps) {
  const [q, setQ] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [status, setStatus] = useState('');

  // Fetch active regions for dropdown
  const { data: wilayahRes } = useSWR<{ data: Array<{ id_wilayah_pembinaan: number; nama_wilayah: string }> }>(
    '/api/anakjuara/wilayah',
    fetcher,
  );
  const wilayahList = wilayahRes?.data ?? [];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onFilterChange({ q, wilayah, status, semester });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [q, wilayah, status, semester, onFilterChange]);

  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
      padding: '16px 18px', marginBottom: 18,
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14,
    }}>
      <div>
        <FLabel>Semester Evaluasi</FLabel>
        <Sel value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="25">Semester Ganjil 2025/2026</option>
          <option value="26">Semester Genap 2025/2026</option>
        </Sel>
      </div>

      <div>
        <FLabel>Cari Nama Anak</FLabel>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#7A6055" style={{ position: 'absolute', left: 10, top: 11 }} />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cari nama / ID..."
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

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
        <FLabel>Status Penilaian</FLabel>
        <Sel value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="has_data">Sudah Dinilai</option>
          <option value="no_data">Belum Dinilai</option>
        </Sel>
      </div>
    </div>
  );
}
