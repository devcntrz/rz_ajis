'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { fmtTgl } from '@/lib/utils';
import type { AnakJuaraRow } from '@/types/anak-juara';

interface AnakJuaraTableProps {
  data:        AnakJuaraRow[];
  loading:     boolean;
  rowOffset?:  number;
  selectedId?: string | null;
  sortBy?:     string;
  sortDir?:    'asc' | 'desc';
  onSort?:     (sortKey: string) => void;
  onSelect:    (row: AnakJuaraRow) => void;
}

const SELECTED = '#1A7A45';
const MUTED = '#7A6055';
const CHARCOAL = '#1A0A00';
const PRIMARY = '#BF4E02';

export function AnakJuaraTable({
  data, loading, rowOffset = 0, selectedId, sortBy, sortDir, onSort, onSelect,
}: AnakJuaraTableProps) {
  const isSel = (r: AnakJuaraRow) =>
    !!selectedId && r.id_pemasangan_baru === selectedId;

  const columns = [
    {
      key: 'no',
      label: '#',
      width: 36,
      sticky: true,
      left: 0,
      render: (r: AnakJuaraRow, i: number) => (
        <span style={{ fontWeight: 700, color: isSel(r) ? SELECTED : MUTED }}>
          {rowOffset + i + 1}
        </span>
      ),
    },
    {
      key: 'id_anak',
      label: 'ID Anak',
      width: 100,
      sticky: true,
      left: 36,
      sortable: true,
      sortKey: 'id_anak',
      render: (r: AnakJuaraRow) => (
        <span style={{ fontWeight: 700, color: isSel(r) ? SELECTED : PRIMARY }}>{r.id_anak}</span>
      ),
    },
    {
      key: 'nama_anak',
      label: 'Nama Anak',
      width: 200,
      sticky: true,
      left: 136,
      sortable: true,
      sortKey: 'nama_anak',
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: isSel(r) ? SELECTED : CHARCOAL }}>
            {r.nama_anak || '—'}
          </div>
          <div style={{ fontSize: 11, color: isSel(r) ? SELECTED : MUTED, opacity: isSel(r) ? 0.85 : 1 }}>
            {r.jenjang_pendidikan} {r.kelas || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 90,
      sticky: true,
      left: 336,
      sortable: true,
      sortKey: 'status_pasangan',
      render: (r: AnakJuaraRow) => (
        <Badge
          label={r.status_pasangan === 'y' ? 'Aktif' : 'Nonaktif'}
          color={isSel(r) ? SELECTED : (r.status_pasangan === 'y' ? '#1A7A45' : MUTED)}
          bg={isSel(r) ? '#E5F5ED' : (r.status_pasangan === 'y' ? '#E5F5ED' : '#F2EAE3')}
        />
      ),
    },
    {
      key: 'donatur',
      label: 'Donatur',
      width: 180,
      sticky: true,
      left: 426,
      sep: true,
      sortable: true,
      sortKey: 'nama_donatur',
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 600, color: isSel(r) ? SELECTED : CHARCOAL }}>
            {r.nama_donatur || '—'}
          </div>
          <div style={{ fontSize: 11, color: isSel(r) ? SELECTED : MUTED, opacity: isSel(r) ? 0.85 : 1 }}>
            {r.id_donatur}
          </div>
        </div>
      ),
    },
    {
      key: 'program',
      label: 'Program',
      width: 160,
      sortable: true,
      sortKey: 'program_donasi',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: isSel(r) ? SELECTED : undefined }}>{r.program_donasi || '—'}</span>
      ),
    },
    {
      key: 'rfo',
      label: 'Funding',
      width: 150,
      sortable: true,
      sortKey: 'nama_rfo',
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 600, color: isSel(r) ? SELECTED : CHARCOAL }}>{r.nama_rfo || '—'}</div>
          <div style={{ fontSize: 11, color: isSel(r) ? SELECTED : MUTED, opacity: isSel(r) ? 0.85 : 1 }}>
            {r.nia_rfo}
          </div>
        </div>
      ),
    },
    {
      key: 'kantor',
      label: 'Kantor',
      width: 140,
      sortable: true,
      sortKey: 'nama_kantor',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: isSel(r) ? SELECTED : undefined }}>{r.nama_kantor || '—'}</span>
      ),
    },
    {
      key: 'wilayah',
      label: 'Wilayah',
      width: 150,
      sortable: true,
      sortKey: 'nama_wilayah',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: isSel(r) ? SELECTED : undefined }}>{r.nama_wilayah || '—'}</span>
      ),
    },
    {
      key: 'tgl',
      label: 'Tgl Pasang',
      width: 110,
      sortable: true,
      sortKey: 'tgl_pemasangan',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: isSel(r) ? SELECTED : undefined }}>{fmtTgl(r.tgl_pemasangan)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.id_pemasangan_baru}
      loading={loading}
      selectedKey={selectedId}
      selectedTextColor={SELECTED}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
      onRowClick={onSelect}
      minWidth={1400}
      emptyText="Tidak ada data pemasangan Anak Juara."
    />
  );
}
