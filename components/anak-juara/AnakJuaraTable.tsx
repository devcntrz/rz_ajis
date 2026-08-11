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
  onSelect:    (row: AnakJuaraRow) => void;
}

export function AnakJuaraTable({
  data, loading, rowOffset = 0, selectedId, onSelect,
}: AnakJuaraTableProps) {
  const columns = [
    {
      key: 'no',
      label: '#',
      width: 36,
      sticky: true,
      left: 0,
      render: (_r: AnakJuaraRow, i: number) => (
        <span style={{ fontWeight: 700, color: '#7A6055' }}>{rowOffset + i + 1}</span>
      ),
    },
    {
      key: 'id_anak',
      label: 'ID Anak',
      width: 100,
      sticky: true,
      left: 36,
      render: (r: AnakJuaraRow) => (
        <span style={{ fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>
      ),
    },
    {
      key: 'nama_anak',
      label: 'Nama Anak',
      width: 200,
      sticky: true,
      left: 136,
      sep: true,
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1A0A00' }}>{r.nama_anak || '—'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.jenjang_pendidikan} {r.kelas || ''}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 80,
      render: (r: AnakJuaraRow) => (
        <Badge
          label={r.status_pasangan === 'y' ? 'Aktif' : 'Nonaktif'}
          color={r.status_pasangan === 'y' ? '#1A7A45' : '#7A6055'}
          bg={r.status_pasangan === 'y' ? '#E5F5ED' : '#F2EAE3'}
        />
      ),
    },
    {
      key: 'donatur',
      label: 'Donatur',
      width: 180,
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.nama_donatur || '—'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.id_donatur}</div>
        </div>
      ),
    },
    {
      key: 'program',
      label: 'Program',
      width: 160,
      render: (r: AnakJuaraRow) => <span>{r.program_donasi || '—'}</span>,
    },
    {
      key: 'rfo',
      label: 'Funding',
      width: 150,
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.nama_rfo || '—'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.nia_rfo}</div>
        </div>
      ),
    },
    {
      key: 'kantor',
      label: 'Kantor',
      width: 140,
      render: (r: AnakJuaraRow) => <span>{r.nama_kantor || '—'}</span>,
    },
    {
      key: 'wilayah',
      label: 'Wilayah',
      width: 150,
      render: (r: AnakJuaraRow) => <span>{r.nama_wilayah || '—'}</span>,
    },
    {
      key: 'tgl',
      label: 'Tgl Pasang',
      width: 110,
      render: (r: AnakJuaraRow) => <span>{fmtTgl(r.tgl_pemasangan)}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.id_pemasangan_baru}
      loading={loading}
      selectedKey={selectedId}
      onRowClick={onSelect}
      minWidth={1200}
      emptyText="Tidak ada data pemasangan Anak Juara."
    />
  );
}
