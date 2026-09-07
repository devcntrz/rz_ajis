'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Download, Search } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { DataTable } from '@/components/ui/DataTable';
import { RowActions } from '@/components/ui/RowActions';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { EditRowModal } from '@/components/penyaluran/EditRowModal';
import { useAnakGridList, usePenyaluranLookup } from '@/hooks/usePenyaluran';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { fmtRp } from '@/lib/utils';
import type { PenyaluranRow } from '@/types/penyaluran';

const T = { green: '#1A7A45', gray: '#7A6055' };

export function AnakTab() {
  const { kantor, wilayah } = usePenyaluranLookup();
  const [q, setQ] = useState('');
  const [kantorId, setKantorId] = useState('');
  const [wilayahId, setWilayahId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [editRow, setEditRow] = useState<PenyaluranRow | null>(null);

  const list = useAnakGridList({ q, kantor_id: kantorId, id_wilayah_pembinaan: wilayahId, page, limit });
  const refresh = useCallback(() => list.mutate(), [list]);
  const filteredWilayah = kantorId ? wilayah.filter(w => w.kantor_id === kantorId) : wilayah;

  const exportUrl = (() => {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (kantorId) qs.set('kantor_id', kantorId);
    if (wilayahId) qs.set('id_wilayah_pembinaan', wilayahId);
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
          <Input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setPage(1); }} placeholder="Nama/ID anak, donatur…" />
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
        <Btn variant="primary" onClick={() => setPage(1)}><Search size={15} /> Cari</Btn>
        <a href={exportUrl}><Btn variant="outline"><Download size={15} /> Export</Btn></a>
      </div>

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

      {list.total > 0 && (
        <DesktopPagination
          page={page} limit={limit} total={list.total}
          onPageChange={setPage}
          onLimitChange={next => { setLimit(next); setPage(1); }}
        />
      )}

      {editRow && (
        <EditRowModal row={editRow} onClose={() => setEditRow(null)} onSuccess={() => { setEditRow(null); refresh(); }} />
      )}
    </div>
  );
}
