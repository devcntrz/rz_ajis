'use client';
import { DataTable } from '@/components/ui/DataTable';
import { RowActions } from '@/components/ui/RowActions';
import { Badge } from '@/components/ui/Badge';
import type { AjisWilayahPgListItem } from '@/types/wilayah-pg';

interface WilayahPgTableProps {
  data: AjisWilayahPgListItem[];
  loading: boolean;
  onEdit: (row: AjisWilayahPgListItem) => void;
  onDelete: (row: AjisWilayahPgListItem) => void;
  canManage: boolean;
  canDelete: boolean;
  busyId?: number | null;
  page: number;
  limit: number;
}

export function WilayahPgTable({ data, loading, onEdit, onDelete, canManage, canDelete, busyId, page, limit }: WilayahPgTableProps) {
  const columns = [
    {
      key: 'aksi', label: 'Aksi', width: 64, sticky: true,
      render: (r: AjisWilayahPgListItem) => canManage ? (
        <RowActions
          label={`Aksi untuk ${r.namaWilayah}`}
          items={[
            { label: 'Edit', onClick: () => onEdit(r) },
            ...(canDelete ? [{ label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.idWilayahPembinaan }] : []),
          ]}
        />
      ) : null,
    },
    {
      key: 'nama_wilayah', label: 'Nama Wilayah', width: 220, sticky: true,
      render: (r: AjisWilayahPgListItem) => (
        <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.namaWilayah}</div>
      ),
    },
    { key: 'nama_kantor', label: 'Kantor', width: 180, render: (r: AjisWilayahPgListItem) => r.namaKantor ?? '-' },
    { key: 'alamat_wilayah', label: 'Alamat', width: 220, render: (r: AjisWilayahPgListItem) => r.alamatWilayah ?? '-' },
    {
      key: 'status_approve', label: 'Status', width: 120,
      render: (r: AjisWilayahPgListItem) => r.statusApprove === 'y'
        ? <Badge label="Approved" color="#1A7A45" bg="#E5F5ED" />
        : r.statusApprove === 't'
          ? <Badge label="Pending" color="#B87800" bg="#FDF4DC" />
          : '-',
    },
    { key: 'nama_kabupaten', label: 'Kabupaten', width: 160, render: (r: AjisWilayahPgListItem) => r.namaKabupaten ?? '-' },
    { key: 'nama_kecamatan', label: 'Kecamatan', width: 160, render: (r: AjisWilayahPgListItem) => r.namaKecamatan ?? '-' },
    {
      key: 'aktif', label: 'Aktif', width: 100,
      render: (r: AjisWilayahPgListItem) => r.aktif
        ? <Badge label="Aktif" color="#1A7A45" bg="#E5F5ED" />
        : <Badge label="Nonaktif" color="#B02020" bg="#FDEAEA" />,
    },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => String(r.idWilayahPembinaan)}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Belum ada data wilayah."
      rowNumberStart={(page - 1) * limit + 1}
    />
  );
}
