'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { LapsemRow } from '@/types/laporan-semester';

interface LapsemTableProps {
  data:       LapsemRow[];
  loading:    boolean;
  rowOffset?: number;
  onPreview:  (row: LapsemRow) => void;
  onApprove:  (row: LapsemRow) => void;
  approvingId?: string | null;
  canApprove: boolean;
}

const MUTED = '#7A6055';
const CHARCOAL = '#1A0A00';
const PRIMARY = '#BF4E02';

function isApproved(r: LapsemRow) {
  return !!r.id_program_postgree;
}

export function LapsemTable({ data, loading, rowOffset = 0, onPreview, onApprove, approvingId, canApprove }: LapsemTableProps) {
  const columns = [
    {
      key: 'no',
      label: '#',
      width: 40,
      sticky: true,
      render: (r: LapsemRow, i: number) => (
        <span style={{ fontWeight: 700, color: MUTED }}>{rowOffset + i + 1}</span>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      width: 64,
      sticky: true,
      render: (r: LapsemRow) => (
        <RowActions
          label={`Aksi untuk ${r.pm_nama_lengkap || r.nama_lengkap}`}
          items={[
            { label: 'Preview PDF', onClick: () => onPreview(r) },
            {
              label: isApproved(r) ? 'Approve Ulang' : 'Approve',
              onClick: () => onApprove(r),
              disabled: !canApprove || approvingId === r.laporanid,
            },
          ]}
        />
      ),
    },
    {
      key: 'laporanid',
      label: 'Laporan ID',
      width: 150,
      sticky: true,
      render: (r: LapsemRow) => (
        <span style={{ fontWeight: 700, color: PRIMARY }}>{r.laporanid}</span>
      ),
    },
    {
      key: 'semester',
      label: 'Semester',
      width: 130,
      render: (r: LapsemRow) => <span>{r.nama_semester || r.semesterid || '—'}</span>,
    },
    {
      key: 'kantor',
      label: 'Kantor',
      width: 160,
      render: (r: LapsemRow) => <span>{r.nama_kantor || '—'}</span>,
    },
    {
      key: 'nama_anak',
      label: 'Nama Anak',
      width: 200,
      render: (r: LapsemRow) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: CHARCOAL }}>
            {r.pm_nama_lengkap || r.nama_lengkap || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'id_anak',
      label: 'ID Anak',
      width: 100,
      render: (r: LapsemRow) => <span>{r.id_anak}</span>,
    },
    {
      key: 'donatur',
      label: 'Donatur',
      width: 180,
      render: (r: LapsemRow) => (
        <div>
          <div style={{ fontWeight: 600, color: CHARCOAL }}>{r.donatur_nama || '—'}</div>
          <div style={{ fontSize: 11, color: MUTED }}>{r.donatur_id}</div>
        </div>
      ),
    },
    {
      key: 'jns_kel',
      label: 'Jns Kel',
      width: 80,
      render: (r: LapsemRow) => <span>{r.jns_kel === 'l' ? 'Laki-laki' : r.jns_kel === 'p' ? 'Perempuan' : r.jns_kel || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: 130,
      render: (r: LapsemRow) => (
        <Badge
          label={isApproved(r) ? 'Sudah Approve' : 'Belum Approve'}
          color={isApproved(r) ? '#1A7A45' : '#B02020'}
          bg={isApproved(r) ? '#E5F5ED' : '#FDEAEA'}
        />
      ),
    },
    {
      key: 'tgl_insert',
      label: 'Tgl Insert',
      width: 110,
      render: (r: LapsemRow) => <span>{fmtTgl(r.tgl_insert ?? '') || '—'}</span>,
    },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.laporanid}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Tidak ada data laporan semester."
    />
  );
}
