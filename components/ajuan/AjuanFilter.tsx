'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { Btn } from '@/components/ui/Btn';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const BULAN = [
  { v: '1', l: 'Januari' }, { v: '2', l: 'Februari' }, { v: '3', l: 'Maret' },
  { v: '4', l: 'April' }, { v: '5', l: 'Mei' }, { v: '6', l: 'Juni' },
  { v: '7', l: 'Juli' }, { v: '8', l: 'Agustus' }, { v: '9', l: 'September' },
  { v: '10', l: 'Oktober' }, { v: '11', l: 'November' }, { v: '12', l: 'Desember' },
];

interface AjuanFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
  idGroupUser: number;
}

function buildFilters(input: {
  q: string;
  tahun: string;
  bulan: string;
  approve: string;
  eksekusi: string;
  kantorId: string;
}): Record<string, string> {
  return {
    q: input.q.trim(),
    tahun: input.tahun,
    bulan: input.bulan,
    approve_funding: input.approve,
    status_eksekusi: input.eksekusi,
    kantor_id: input.kantorId,
  };
}

export function AjuanFilter({ onFilterChange, idGroupUser }: AjuanFilterProps) {
  const currentYear = String(new Date().getFullYear());
  const [q, setQ] = useState('');
  const [tahun, setTahun] = useState(currentYear);
  const [bulan, setBulan] = useState('');
  const [approve, setApprove] = useState('');
  const [eksekusi, setEksekusi] = useState('');
  const [kantorId, setKantorId] = useState('');
  const [expanded, setExpanded] = useState(true);

  const { data: kantorRes } = useSWR<{ data: Array<{ id_kantor: string; nama_kantor: string }> }>(
    idGroupUser === 1 ? '/api/anakjuara/kantor' : null,
    fetcher,
  );
  const kantorList = kantorRes?.data ?? [];
  const years = Array.from({ length: 6 }, (_, i) => String(Number(currentYear) - i));

  const apply = () => {
    onFilterChange(buildFilters({ q, tahun, bulan, approve, eksekusi, kantorId }));
  };

  const reset = () => {
    setQ('');
    setTahun(currentYear);
    setBulan('');
    setApprove('');
    setEksekusi('');
    setKantorId('');
    onFilterChange(buildFilters({
      q: '',
      tahun: currentYear,
      bulan: '',
      approve: '',
      eksekusi: '',
      kantorId: '',
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
            placeholder="Cari anak, donatur, RFO..."
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
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid #F2EAE3',
        }}>
          <div>
            <FLabel>Tahun</FLabel>
            <Sel value={tahun} onChange={e => setTahun(e.target.value)}>
              <option value="">Semua</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </Sel>
          </div>
          <div>
            <FLabel>Bulan</FLabel>
            <Sel value={bulan} onChange={e => setBulan(e.target.value)}>
              <option value="">Semua</option>
              {BULAN.map(b => <option key={b.v} value={b.v}>{b.l}</option>)}
            </Sel>
          </div>
          <div>
            <FLabel>Approve Funding</FLabel>
            <Sel value={approve} onChange={e => setApprove(e.target.value)}>
              <option value="">Semua</option>
              <option value="t">Pending</option>
              <option value="y">Disetujui</option>
              <option value="n">Ditolak</option>
            </Sel>
          </div>
          <div>
            <FLabel>Eksekusi</FLabel>
            <Sel value={eksekusi} onChange={e => setEksekusi(e.target.value)}>
              <option value="">Semua</option>
              <option value="n">Belum</option>
              <option value="y">Sudah</option>
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
        </div>
      )}
    </div>
  );
}
