'use client';
import { DataTable } from '@/components/ui/DataTable';
import { RowActions } from '@/components/ui/RowActions';
import type { AjisKantorPgListItem } from '@/types/kantor-pg';

interface KantorPgTableProps {
  data: AjisKantorPgListItem[];
  loading: boolean;
  onEdit: (row: AjisKantorPgListItem) => void;
  onDelete: (row: AjisKantorPgListItem) => void;
  canManage: boolean;
  busyId?: number | null;
  page: number;
  limit: number;
}

export function KantorPgTable({ data, loading, onEdit, onDelete, canManage, busyId, page, limit }: KantorPgTableProps) {
  const columns = [
    {
      key: 'aksi', label: 'Aksi', width: 64, sticky: true,
      render: (r: AjisKantorPgListItem) => canManage ? (
        <RowActions
          label={`Aksi untuk ${r.kantor ?? r.oid}`}
          items={[
            { label: 'Edit', onClick: () => onEdit(r) },
            { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.id },
          ]}
        />
      ) : null,
    },
    { key: 'oid', label: 'OID', width: 100, sticky: true, render: (r: AjisKantorPgListItem) => r.oid },
    {
      key: 'kantor', label: 'Nama Kantor', width: 220,
      render: (r: AjisKantorPgListItem) => (
        <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.kantor ?? '-'}</div>
      ),
    },
    { key: 'alamat', label: 'Alamat', width: 220, render: (r: AjisKantorPgListItem) => r.alamat ?? '-' },
    { key: 'no_telp', label: 'No. Telp', width: 140, render: (r: AjisKantorPgListItem) => r.noTelp ?? '-' },
    { key: 'oid_parent', label: 'Parent', width: 100, render: (r: AjisKantorPgListItem) => r.oidParent ?? '-' },
    { key: 'jenis', label: 'Jenis', width: 140, render: (r: AjisKantorPgListItem) => r.jenis ?? '-' },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => String(r.id)}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Belum ada data kantor."
      rowNumberStart={(page - 1) * limit + 1}
    />
  );
}
