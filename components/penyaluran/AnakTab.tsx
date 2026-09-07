'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Download, Search } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { DataTable } from '@/components/ui/DataTable';
import { RowActions } from '@/components/ui/RowActions';
import { SimplePager } from '@/components/ui/SimplePager';
import { ErrorRetry } from '@/components/ui/ErrorRetry';
import type { PageSizeOption } from '@/components/ui/DesktopPagination';
import { EditRowModal } from '@/components/penyaluran/EditRowModal';
import { useAnakGridList, usePenyaluranLookup } from '@/hooks/usePenyaluran';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { fmtRp } from '@/lib/utils';
import type { PenyaluranRow } from '@/types/penyaluran';

const T = { green: '#1A7A45', gray: '#7A6055' };

export function AnakTab() {
  const { kantor, wilayah } = usePenyaluranLookup();
  // Staged like TransaksiFilter: the grid refetches on "Cari", not on every keystroke —
  // an unstaged `q` used to trigger a LIKE scan per keypress.
  const [qDraft, setQDraft] = useState('');
  const [q, setQ] = useState('');
  const [kantorId, setKantorId] = useState('');
  const [wilayahId, setWilayahId] = useState('');
  const [bulan, setBulan] = useState('');
  // No "Semua" option: an unfiltered year scans the whole table server-side
  // (lib/penyaluran/queries.ts::defaultTahun), which is what made this grid feel stuck.
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [page, setPage] = useState(1);
  const limit: PageSizeOption = DEFAULT_PAGE_SIZE;
  const [editRow, setEditRow] = useState<PenyaluranRow | null>(null);

  const list = useAnakGridList({
    q, kantor_id: kantorId, id_wilayah_pembinaan: wilayahId, bulan, tahun, page, limit,
  });
  const refresh = useCallback(() => list.mutate(), [list]);
  const filteredWilayah = kantorId ? wilayah.filter(w => w.kantor_id === kantorId) : wilayah;

  const search = () => { setQ(qDraft); setPage(1); };

  const exportUrl = (() => {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (kantorId) qs.set('kantor_id', kantorId);
    if (wilayahId) qs.set('id_wilayah_pembinaan', wilayahId);
    if (bulan) qs.set('bulan', bulan);
    if (tahun) qs.set('tahun', tahun);
    return `/api/anakjuara/penyaluran/anak/export${qs.toString() ? `?${qs}` : ''}`;
  })();

  const handleDelete = async (row: PenyaluranRow) => {
    if (!window.confirm(`Hapus baris penyaluran ${row.nama_anak} (${fmtRp(row.nominal_penyaluran)})?`)) return;
    const res = await fetch(
      `/api/anakjuara/penyaluran/${encodeURIComponent(row.id_penyaluran)}/rows/${row.id_row}`,
      { method: 'DELETE' },
    );
    const json = await res.json();
    if (!res.ok) { toast.error(json.error || 'Gagal menghapus.'); return; }
    toast.success(json.message || 'Baris dihapus.');
    refresh();
  };

  const columns = [
    {
      key: 'nama_anak', label: 'Anak', width: 200, sticky: true, sep: true,
      render: (r: PenyaluranRow) => <strong>{r.nama_anak}</strong>,
    },
    { key: 'id_anak', label: 'ID Anak', width: 110, render: (r: PenyaluranRow) => r.id_anak },
    { key: 'nama_donatur', label: 'Donatur', width: 190, render: (r: PenyaluranRow) => r.nama_donatur || '-' },
    { key: 'program_donasi', label: 'Program', width: 200, render: (r: PenyaluranRow) => r.program_donasi || '-' },
    {
      key: 'nominal_penyaluran', label: 'Nominal', width: 130, align: 'right' as const,
      render: (r: PenyaluranRow) => <strong style={{ color: T.green }}>{fmtRp(r.nominal_penyaluran)}</strong>,
    },
    { key: 'nominal_hpp', label: 'HPP', width: 120, align: 'right' as const, render: (r: PenyaluranRow) => fmtRp(r.nominal_hpp) },
    { key: 'bulan', label: 'Bulan', width: 70, align: 'right' as const, render: (r: PenyaluranRow) => r.bulan },
    { key: 'tahun', label: 'Tahun', width: 80, align: 'right' as const, sep: true, render: (r: PenyaluranRow) => r.tahun },
    { key: 'via_input', label: 'Via', width: 90, render: (r: PenyaluranRow) => r.via_input },
    { key: 'nama_kantor', label: 'Kantor', width: 170, render: (r: PenyaluranRow) => r.nama_kantor || '-' },
    { key: 'nama_wilayah', label: 'Wilayah', width: 170, render: (r: PenyaluranRow) => r.nama_wilayah || '-' },
    { key: 'id_penyaluran', label: 'ID Penyaluran', width: 150, render: (r: PenyaluranRow) => r.id_penyaluran },
    {
      key: 'aksi', label: '', width: 56,
      render: (r: PenyaluranRow) => (
        <RowActions
          label={`Aksi ${r.nama_anak}`}
          items={[
            { label: 'Edit baris', onClick: () => setEditRow(r) },
            { label: 'Hapus baris', onClick: () => handleDelete(r), danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 220px', minWidth: 200 }}>
          <FLabel>Cari</FLabel>
          <Input value={qDraft} onChange={e => setQDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') search(); }} placeholder="Nama/ID anak, donatur…" />
        </div>
        <div style={{ minWidth: 160 }}>
          <FLabel>Kantor</FLabel>
          <Sel value={kantorId} onChange={e => { setKantorId(e.target.value); setWilayahId(''); setPage(1); }}>
            <option value="">Semua</option>
            {kantor.map(k => <option key={k.oid} value={k.oid}>{k.kantor}</option>)}
          </Sel>
        </div>
        <div style={{ minWidth: 160 }}>
          <FLabel>Wilayah</FLabel>
          <Sel value={wilayahId} onChange={e => { setWilayahId(e.target.value); setPage(1); }}>
            <option value="">Semua</option>
            {filteredWilayah.map(w => (
              <option key={w.id_wilayah_pembinaan} value={String(w.id_wilayah_pembinaan)}>{w.nama_wilayah}</option>
            ))}
          </Sel>
        </div>
        <div style={{ minWidth: 100 }}>
          <FLabel>Bulan</FLabel>
          <Sel value={bulan} onChange={e => { setBulan(e.target.value); setPage(1); }}>
            <option value="">Semua</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(b => <option key={b} value={String(b)}>{b}</option>)}
          </Sel>
        </div>
        <div style={{ minWidth: 100 }}>
          <FLabel>Tahun</FLabel>
          <Sel value={tahun} onChange={e => { setTahun(e.target.value); setPage(1); }}>
            {[0, 1, 2].map(d => {
              const y = new Date().getFullYear() - d;
              return <option key={y} value={String(y)}>{y}</option>;
            })}
          </Sel>
        </div>
        <Btn variant="primary" onClick={search}><Search size={15} /> Cari</Btn>
        <a href={exportUrl}><Btn variant="outline"><Download size={15} /> Export</Btn></a>
      </div>

      {list.error ? (
        <ErrorRetry
          message={list.error.message || 'Gagal memuat data penyaluran anak.'}
          onRetry={refresh}
        />
      ) : (
        <div className="datagrid-desktop">
          <DataTable<PenyaluranRow>
            columns={columns}
            data={list.isReady ? list.data : []}
            loading={!list.isReady}
            rowKey={r => `${r.id_penyaluran}::${r.id_row}`}
            gridLines
            minWidth={1700}
            emptyText="Tidak ada baris penyaluran untuk filter ini."
          />
        </div>
      )}

      {list.data.length > 0 && (
        <SimplePager
          page={page} hasMore={list.hasMore} onPageChange={setPage}
          shownCount={list.data.length}
        />
      )}

      {editRow && (
        <EditRowModal row={editRow} onClose={() => setEditRow(null)} onSuccess={() => { setEditRow(null); refresh(); }} />
      )}
    </div>
  );
}
