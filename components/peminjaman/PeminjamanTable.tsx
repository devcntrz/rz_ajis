'use client';
import { RowActions } from '@/components/ui/RowActions';
import { DataTable } from '@/components/ui/DataTable';
import { fmtTgl } from '@/lib/utils';
import type { PeminjamanAnakRow } from '@/types/peminjaman';

interface Props {
  data: PeminjamanAnakRow[];
  loading: boolean;
  rowOffset?: number;
  onCancel: (row: PeminjamanAnakRow) => void;
  onPasangDonatur: (row: PeminjamanAnakRow) => void;
}

export function PeminjamanTable({ data, loading, rowOffset = 0, onCancel, onPasangDonatur }: Props) {
  const columns = [
    {
      key: 'aksi', label: '', width: 52, sticky: true,
      render: (r: PeminjamanAnakRow) => (
        <RowActions
          label={`Aksi peminjaman ${r.nama_anak || r.id_anak}`}
          items={[
            { label: 'Pasang ke Donatur', onClick: () => onPasangDonatur(r) },
            { label: 'Batalkan Peminjaman', onClick: () => onCancel(r), danger: true, disabled: r.cancel === 'y' },
          ]}
        />
      ),
    },
    {
      key: 'nama_anak', label: 'Anak', width: 200, sticky: true, sep: true,
      render: (r: PeminjamanAnakRow) => (
        <div>
          <div style={{ fontWeight: 700 }}>{r.nama_anak || '-'}</div>
          <div style={{ fontSize: 10, color: '#7A6055' }}>{r.id_anak}</div>
        </div>
      ),
    },
    {
      key: 'nama_peminjam', label: 'Peminjam', width: 200,
      render: (r: PeminjamanAnakRow) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.nama_peminjam || '-'}</div>
          <div style={{ fontSize: 10, color: '#7A6055' }}>
            {r.tipe_peminjam === 'karyawan' ? 'Karyawan ZISCO' : 'Donatur'}
          </div>
        </div>
      ),
    },
    {
      key: 'nama_kantor', label: 'Kantor', width: 150,
      render: (r: PeminjamanAnakRow) => r.nama_kantor || '-',
    },
    {
      key: 'nama_wilayah', label: 'Wilayah', width: 160,
      render: (r: PeminjamanAnakRow) => r.nama_wilayah || '-',
    },
    {
      key: 'tgl_awal', label: 'Tgl Awal', width: 110,
      render: (r: PeminjamanAnakRow) => fmtTgl(r.tgl_awal_peminjaman),
    },
    {
      key: 'tgl_expired', label: 'Tgl Expired', width: 110,
      render: (r: PeminjamanAnakRow) => fmtTgl(r.tgl_expired),
    },
    {
      key: 'status', label: 'Status', width: 120,
      render: (r: PeminjamanAnakRow) => {
        if (r.cancel === 'y') return 'Dibatalkan';
        if (r.tgl_selesai_peminjaman) return 'Selesai';
        return r.status_pinjam === 'y' ? 'Aktif' : '-';
      },
    },
  ];

  return (
    <DataTable<PeminjamanAnakRow>
      columns={columns}
      data={data}
      loading={loading}
      rowKey={r => String(r.id_peminjaman)}
      rowNumberStart={rowOffset + 1}
      gridLines
      stickyHeader
      minWidth={1198}
      emptyText="Tidak ada peminjaman anak."
    />
  );
}
