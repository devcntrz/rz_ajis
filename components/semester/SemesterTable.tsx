'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { Semester } from '@/types/semester';

interface SemesterTableProps {
  data:     Semester[];
  loading:  boolean;
  onEdit:   (row: Semester) => void;
  onDelete: (row: Semester) => void;
  onActivate: (row: Semester) => void;
  onTemplate: (row: Semester) => void;
  busyId?: number | null;
}

export function SemesterTable({ data, loading, onEdit, onDelete, onActivate, onTemplate, busyId }: SemesterTableProps) {
  const columns = [
    {
      key: 'aksi',
      label: 'Aksi',
      width: 64,
      sticky: true,
      render: (r: Semester) => (
        <RowActions
          label={`Aksi untuk ${r.semester}`}
          items={[
            { label: 'Jadikan Aktif', onClick: () => onActivate(r), disabled: r.onprogress === 'y' || busyId === r.id },
            { label: 'Template PDF', onClick: () => onTemplate(r) },
            { label: 'Edit', onClick: () => onEdit(r) },
            { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.id },
          ]}
        />
      ),
    },
    {
      key: 'semester',
      label: 'Semester',
      width: 200,
      render: (r: Semester) => <span style={{ fontWeight: 700, color: '#1A0A00' }}>{r.semester}</span>,
    },
    {
      key: 'semesterid',
      label: 'Semester ID',
      width: 120,
      render: (r: Semester) => <span style={{ color: '#BF4E02', fontWeight: 700 }}>{r.semesterid}</span>,
    },
    {
      key: 'tgl_awal',
      label: 'Tgl Awal',
      width: 120,
      render: (r: Semester) => <span>{fmtTgl(r.tgl_awal)}</span>,
    },
    {
      key: 'tgl_akhir',
      label: 'Tgl Akhir',
      width: 120,
      render: (r: Semester) => <span>{fmtTgl(r.tgl_akhir)}</span>,
    },
    {
      key: 'onprogress',
      label: 'Status',
      width: 110,
      render: (r: Semester) => (
        <Badge
          label={r.onprogress === 'y' ? 'Aktif' : 'Nonaktif'}
          color={r.onprogress === 'y' ? '#1A7A45' : '#7A6055'}
          bg={r.onprogress === 'y' ? '#E5F5ED' : '#F2EAE3'}
        />
      ),
    },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => String(r.id)}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Belum ada data semester."
    />
  );
}
