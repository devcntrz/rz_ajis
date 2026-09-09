'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { AjisUserPgListItem } from '@/types/user-pg';

interface UserPgTableProps {
  data: AjisUserPgListItem[];
  loading: boolean;
  onEdit: (row: AjisUserPgListItem) => void;
  onDelete: (row: AjisUserPgListItem) => void;
  canDelete: boolean;
  busyId?: number | null;
  page: number;
  limit: number;
}

export function UserPgTable({ data, loading, onEdit, onDelete, canDelete, busyId, page, limit }: UserPgTableProps) {
  const columns = [
    {
      key: 'aksi', label: 'Aksi', width: 64, sticky: true,
      render: (r: AjisUserPgListItem) => (
        <RowActions
          label={`Aksi untuk ${r.username}`}
          items={[
            { label: 'Edit', onClick: () => onEdit(r) },
            ...(canDelete
              ? [{ label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.idUser }]
              : []),
          ]}
        />
      ),
    },
    {
      key: 'username', label: 'Username', width: 180, sticky: true,
      render: (r: AjisUserPgListItem) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.username}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.email ?? '-'}</div>
        </div>
      ),
    },
    { key: 'nik', label: 'NIK', width: 140, render: (r: AjisUserPgListItem) => r.nik ?? '-' },
    {
      key: 'role', label: 'Peran', width: 150,
      render: (r: AjisUserPgListItem) => r.groupUser
        ? <Badge label={r.groupUser} color="#1A5FA8" bg="#E5EEF8" />
        : <span style={{ color: '#7A6055' }}>-</span>,
    },
    { key: 'wilayah', label: 'Wilayah', width: 150, render: (r: AjisUserPgListItem) => r.namaWilayah ?? '-' },
    { key: 'kantor', label: 'Kantor', width: 150, render: (r: AjisUserPgListItem) => r.namaKantor ?? '-' },
    { key: 'date_insert', label: 'Terdaftar', width: 120, render: (r: AjisUserPgListItem) => fmtTgl(r.dateInsert) },
    {
      key: 'aktif', label: 'Aktif', width: 90,
      render: (r: AjisUserPgListItem) => (
        <Badge
          label={r.aktif ? 'Aktif' : 'Nonaktif'}
          color={r.aktif ? '#1A7A45' : '#7A6055'}
          bg={r.aktif ? '#E5F5ED' : '#F2EAE3'}
        />
      ),
    },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => String(r.idUser)}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Belum ada data user."
      rowNumberStart={(page - 1) * limit + 1}
    />
  );
}
