'use client';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Input, Sel } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { Btn } from '@/components/ui/Btn';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Props {
  onFilterChange: (filters: Record<string, string>) => void;
  idGroupUser: number;
}

function buildFilters(input: {
  q: string; kantorId: string; wilayah: string; status: string; tipe: string; tglFrom: string; tglTo: string;
}): Record<string, string> {
  return {
    q: input.q.trim(),
    kantor_id: input.kantorId,
    wilayah: input.wilayah,
    status: input.status,
    tipe_peminjam: input.tipe,
    tgl_awal_from: input.tglFrom,
    tgl_awal_to: input.tglTo,
  };
}

export function PeminjamanFilter({ onFilterChange, idGroupUser }: Props) {
  const [q, setQ] = useState('');
  const [kantorId, setKantorId] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [status, setStatus] = useState('');
  const [tipe, setTipe] = useState('');
  const [tglFrom, setTglFrom] = useState('');
  const [tglTo, setTglTo] = useState('');
  const [expanded, setExpanded] = useState(false);

  const wilayahKey = idGroupUser === 1
    ? (kantorId ? `/api/anakjuara/wilayah?kantor_id=${encodeURIComponent(kantorId)}` : null)
    : '/api/anakjuara/wilayah';

  const { data: wilayahRes } = useSWR<{ data: Array<{ id_wilayah_pembinaan: number; nama_wilayah: string }> }>(
    wilayahKey, fetcher, { revalidateOnFocus: false, revalidateOnReconnect: false },
  );
  const { data: kantorRes } = useSWR<{ data: Array<{ id_kantor: string; nama_kantor: string }> }>(
    idGroupUser === 1 ? '/api/anakjuara/kantor' : null,
    fetcher, { revalidateOnFocus: false, revalidateOnReconnect: false },
  );

  const wilayahOptions = useMemo(
    () => (wilayahRes?.data ?? []).map(w => ({ value: String(w.id_wilayah_pembinaan), label: w.nama_wilayah })),
    [wilayahRes],
  );
  const kantorOptions = useMemo(
    () => (kantorRes?.data ?? []).map(k => ({ value: k.id_kantor, label: k.nama_kantor })),
    [kantorRes],
  );

  const apply = () => onFilterChange(buildFilters({ q, kantorId, wilayah, status, tipe, tglFrom, tglTo }));

  const reset = () => {
    setQ(''); setKantorId(''); setWilayah(''); setStatus(''); setTipe(''); setTglFrom(''); setTglTo('');
    onFilterChange(buildFilters({ q: '', kantorId: '', wilayah: '', status: '', tipe: '', tglFrom: '', tglTo: '' }));
  };

  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16, padding: '14px 18px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} color="#7A6055" style={{ position: 'absolute', left: 11, top: 11 }} />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') apply(); }}
            placeholder="Cari nama/ID anak atau peminjam…"
            style={{ paddingLeft: 34 }}
          />
        </div>
        <Btn onClick={() => setExpanded(!expanded)} variant="outline" style={{ height: 38 }}>
          <SlidersHorizontal size={15} />
          <span>Filter</span>
        </Btn>
        <Btn variant="primary" onClick={apply} style={{ height: 38 }}>Terapkan Filter</Btn>
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
          {idGroupUser === 1 && (
            <div>
              <FLabel>Kantor</FLabel>
              <SearchSelect
                value={kantorId} onChange={v => { setKantorId(v); setWilayah(''); }} options={kantorOptions}
                allowEmpty emptyLabel="Semua kantor" clearable placeholder="Ketik atau pilih kantor…"
              />
            </div>
          )}
          <div>
            <FLabel>Wilayah</FLabel>
            <SearchSelect
              value={wilayah} onChange={setWilayah} options={wilayahOptions}
              disabled={idGroupUser === 1 && !kantorId}
              allowEmpty emptyLabel="Semua wilayah" clearable
              placeholder={idGroupUser === 1 && !kantorId ? 'Pilih kantor dulu' : 'Ketik nama wilayah…'}
            />
          </div>
          <div>
            <FLabel>Tipe Peminjam</FLabel>
            <Sel value={tipe} onChange={e => setTipe(e.target.value)}>
              <option value="">Semua</option>
              <option value="karyawan">Karyawan ZISCO</option>
              <option value="donatur">Donatur</option>
            </Sel>
          </div>
          <div>
            <FLabel>Status</FLabel>
            <Sel value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="cancel">Dibatalkan</option>
            </Sel>
          </div>
          <div>
            <FLabel>Tgl Awal Dari</FLabel>
            <Input type="date" value={tglFrom} onChange={e => setTglFrom(e.target.value)} />
          </div>
          <div>
            <FLabel>Tgl Awal Sampai</FLabel>
            <Input type="date" value={tglTo} onChange={e => setTglTo(e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
