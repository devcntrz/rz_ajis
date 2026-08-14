'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { Btn } from '@/components/ui/Btn';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AnakJuaraFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
  idGroupUser: number;
}

function buildFilters(input: {
  q: string;
  tahun: string;
  wilayah: string;
  kantorId: string;
  statusPasangan: string;
}): Record<string, string> {
  return {
    q: input.q.trim(),
    tahun: input.tahun,
    wilayah: input.wilayah,
    kantor_id: input.kantorId,
    status_pasangan: input.statusPasangan,
  };
}

export function AnakJuaraFilter({ onFilterChange, idGroupUser }: AnakJuaraFilterProps) {
  const currentYear = String(new Date().getFullYear());
  const [q, setQ] = useState('');
  const [tahun, setTahun] = useState(currentYear);
  const [wilayah, setWilayah] = useState('');
  const [kantorId, setKantorId] = useState('');
  const [statusPasangan, setStatusPasangan] = useState('y');
  const [expanded, setExpanded] = useState(true);

  const wilayahKey = idGroupUser === 1
    ? (kantorId
      ? `/api/anakjuara/wilayah?kantor_id=${encodeURIComponent(kantorId)}`
      : null)
    : '/api/anakjuara/wilayah';

  const { data: wilayahRes } = useSWR<{ data: Array<{ id_wilayah_pembinaan: number; nama_wilayah: string }> }>(
    wilayahKey,
    fetcher,
  );
  const { data: kantorRes } = useSWR<{ data: Array<{ id_kantor: string; nama_kantor: string }> }>(
    idGroupUser === 1 ? '/api/anakjuara/kantor' : null,
    fetcher,
  );

  const wilayahList = wilayahRes?.data ?? [];
  const kantorList = kantorRes?.data ?? [];
  const years = Array.from({ length: 6 }, (_, i) => String(Number(currentYear) - i));

  // Cascade only: clear wilayah draft when kantor changes (does not fetch list yet until apply)
  useEffect(() => {
    setWilayah('');
  }, [kantorId]);

  useEffect(() => {
    if (!wilayah) return;
    const stillValid = wilayahList.some(w => String(w.id_wilayah_pembinaan) === wilayah);
    if (!stillValid) setWilayah('');
  }, [wilayahList, wilayah]);

  const apply = () => {
    onFilterChange(buildFilters({ q, tahun, wilayah, kantorId, statusPasangan }));
  };

  const reset = () => {
    setQ('');
    setTahun(currentYear);
    setWilayah('');
    setKantorId('');
    setStatusPasangan('y');
    onFilterChange(buildFilters({
      q: '',
      tahun: currentYear,
      wilayah: '',
      kantorId: '',
      statusPasangan: 'y',
    }));
  };

  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
      padding: '14px 18px',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} color="#7A6055" style={{ position: 'absolute', left: 11, top: 11 }} />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') apply(); }}
            placeholder="Cari anak, donatur, kantor, RFO..."
            style={{ paddingLeft: 34 }}
          />
        </div>
        <Btn onClick={() => setExpanded(!expanded)} variant="outline" style={{ height: 38 }}>
          <SlidersHorizontal size={15} />
          <span>Filter</span>
        </Btn>
        <Btn variant="primary" onClick={apply} style={{ height: 38 }}>
          Terapkan Filter
        </Btn>
        <Btn variant="ghost" onClick={reset} style={{ height: 38 }}>
          <RotateCcw size={14} />
          Reset
        </Btn>
      </div>

      {expanded && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid #F2EAE3',
        }}>
          <div>
            <FLabel>Tahun</FLabel>
            <Sel value={tahun} onChange={e => setTahun(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </Sel>
          </div>
          <div>
            <FLabel>Status Pasangan</FLabel>
            <Sel value={statusPasangan} onChange={e => setStatusPasangan(e.target.value)}>
              <option value="">Semua</option>
              <option value="y">Aktif</option>
              <option value="n">Nonaktif</option>
            </Sel>
          </div>
          {idGroupUser === 1 && (
            <div>
              <FLabel>Kantor</FLabel>
              <Sel value={kantorId} onChange={e => setKantorId(e.target.value)}>
                <option value="">Semua Kantor</option>
                {kantorList.map(k => (
                  <option key={k.id_kantor} value={k.id_kantor}>{k.nama_kantor}</option>
                ))}
              </Sel>
            </div>
          )}
          <div>
            <FLabel>Wilayah</FLabel>
            <Sel
              value={wilayah}
              onChange={e => setWilayah(e.target.value)}
              disabled={idGroupUser === 1 && !kantorId}
            >
              <option value="">
                {idGroupUser === 1 && !kantorId ? 'Pilih kantor dulu' : 'Semua Wilayah'}
              </option>
              {wilayahList.map(w => (
                <option key={w.id_wilayah_pembinaan} value={String(w.id_wilayah_pembinaan)}>
                  {w.nama_wilayah}
                </option>
              ))}
            </Sel>
          </div>
        </div>
      )}
    </div>
  );
}
