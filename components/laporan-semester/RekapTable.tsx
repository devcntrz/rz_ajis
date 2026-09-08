'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import type { RekapKantorRow } from '@/types/laporan-semester';

interface RekapTableProps {
  data:    RekapKantorRow[];
  loading: boolean;
}

function fmt(n: number) {
  return Number(n || 0).toLocaleString('id-ID');
}

export function RekapTable({ data, loading }: RekapTableProps) {
  const columns = [
    { key: 'oid', label: 'Kode Kantor', width: 110, sticky: true, render: (r: RekapKantorRow) => <span style={{ fontWeight: 700, color: '#BF4E02' }}>{r.oid}</span> },
    { key: 'kantor', label: 'Nama Kantor', width: 200, sticky: true, render: (r: RekapKantorRow) => <span style={{ fontWeight: 700 }}>{r.kantor}</span> },
    { key: 'jml_laporan', label: 'Jml Laporan', width: 110, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_laporan) },
    { key: 'jml_status_terbuat', label: 'Terbuat', width: 100, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_status_terbuat) },
    {
      key: 'persentase', label: 'Persentase', width: 110, align: 'right' as const,
      render: (r: RekapKantorRow) => (
        <Badge
          label={`${r.persentase}%`}
          color={r.persentase >= 80 ? '#1A7A45' : r.persentase >= 40 ? '#B87800' : '#B02020'}
          bg={r.persentase >= 80 ? '#E5F5ED' : r.persentase >= 40 ? '#FDF4DC' : '#FDEAEA'}
        />
      ),
    },
    { key: 'jml_foto', label: 'Foto Anak', width: 100, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_foto) },
    { key: 'jml_foto_pembinaan', label: 'Foto Pembinaan', width: 130, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_foto_pembinaan) },
    { key: 'jml_raport_ceria', label: 'Raport Ceria', width: 110, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_raport_ceria) },
    { key: 'jml_raport_satu', label: 'Raport 1', width: 90, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_raport_satu) },
    { key: 'jml_raport_dua', label: 'Raport 2', width: 90, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_raport_dua) },
    { key: 'jml_surat_suara_hati', label: 'Surat Suara Hati', width: 140, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_surat_suara_hati) },
    { key: 'jml_dana_saldo_awal', label: 'Saldo Awal', width: 110, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_dana_saldo_awal) },
    { key: 'jml_dana_penerimaan', label: 'Penerimaan', width: 110, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_dana_penerimaan) },
    { key: 'jml_dana_penyaluran', label: 'Penyaluran', width: 110, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_dana_penyaluran) },
    { key: 'jml_materi', label: 'Materi', width: 90, align: 'right' as const, render: (r: RekapKantorRow) => fmt(r.jml_materi) },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.oid}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Tidak ada data rekap untuk semester ini."
    />
  );
}
