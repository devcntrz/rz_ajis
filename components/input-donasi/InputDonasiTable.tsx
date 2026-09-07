'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtRp, fmtTgl } from '@/lib/utils';
import type { InputDonasi } from '@/types/input-donasi';

const T = {
  green: '#1A7A45', greenPale: '#E5F5ED',
  blue: '#1A5FA8', bluePale: '#E5EEF8',
  gray: '#7A6055',
};

interface Props {
  data:      InputDonasi[];
  loading:   boolean;
  rowOffset: number;
  isAdmin:   boolean;
  onDelete:  (row: InputDonasi) => void;
}

export function InputDonasiTable({ data, loading, rowOffset, isAdmin, onDelete }: Props) {
  const columns = [
    {
      key: 'no', label: '#', width: 50, sticky: true, align: 'right' as const,
      render: (_r: InputDonasi, i: number) => <span style={{ color: T.gray }}>{rowOffset + i + 1}</span>,
    },
    {
      key: 'nama_anak', label: 'Anak', width: 200, sticky: true, sep: true,
      render: (r: InputDonasi) => <span style={{ fontWeight: 700 }}>{r.nama_anak || '-'}</span>,
    },
    { key: 'id_anak', label: 'ID Anak', width: 110, render: (r: InputDonasi) => r.id_anak },
    { key: 'nama_donatur', label: 'Donatur', width: 190, render: (r: InputDonasi) => r.nama_donatur || '-' },
    { key: 'id_donatur', label: 'ID Donatur', width: 110, render: (r: InputDonasi) => r.id_donatur },
    { key: 'program_donasi', label: 'Program', width: 220, render: (r: InputDonasi) => r.program_donasi || '-' },
    {
      key: 'nominal_donasi', label: 'Nominal', width: 130, align: 'right' as const,
      render: (r: InputDonasi) => <strong>{fmtRp(r.nominal_donasi)}</strong>,
    },
    { key: 'qty', label: 'Qty', width: 60, align: 'right' as const, render: (r: InputDonasi) => r.qty },
    { key: 'bulan', label: 'Bulan', width: 80, align: 'right' as const, render: (r: InputDonasi) => r.bulan },
    { key: 'tahun', label: 'Tahun', width: 80, align: 'right' as const, sep: true, render: (r: InputDonasi) => r.tahun },
    {
      key: 'jenis', label: 'Jenis', width: 100,
      render: (r: InputDonasi) => r.jenis === 'trans'
        ? <Badge label="Transaksi" color={T.blue} bg={T.bluePale} />
        : <Badge label="Saldo" color={T.green} bg={T.greenPale} />,
    },
    { key: 'transid', label: 'Trans ID', width: 150, render: (r: InputDonasi) => r.transid || '-' },
    { key: 'detailid', label: 'Detail ID', width: 85, align: 'right' as const, render: (r: InputDonasi) => r.detailid },
    { key: 'nama_kantor', label: 'Kantor', width: 170, render: (r: InputDonasi) => r.nama_kantor || '-' },
    { key: 'nama_wilayah', label: 'Wilayah', width: 170, render: (r: InputDonasi) => r.nama_wilayah || '-' },
    { key: 'tgl_transaksi', label: 'Tgl Transaksi', width: 120, render: (r: InputDonasi) => fmtTgl(r.tgl_transaksi) },
    {
      key: 'aksi', label: '', width: 56,
      render: (r: InputDonasi) => (
        <RowActions
          label={`Aksi ${r.nama_anak}`}
          items={[
            { label: 'Hapus baris', onClick: () => onDelete(r), danger: true, disabled: !isAdmin },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable<InputDonasi>
      columns={columns}
      data={data}
      loading={loading}
      rowKey={r => String(r.id_input_donasi)}
      gridLines
      minWidth={2000}
      emptyText="Tidak ada donasi untuk filter ini."
    />
  );
}
