'use client';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { fmtTgl } from '@/lib/utils';
import type { Pembinaan } from '@/types/pembinaan';

interface PembinaanTableProps {
  data:       Pembinaan[];
  loading:    boolean;
  rowOffset?: number;
}

export function PembinaanTable({ data, loading, rowOffset = 0 }: PembinaanTableProps) {
  const router = useRouter();

  const columns = [
    {
      key: 'no',
      label: '#',
      width: 36,
      sticky: true,
      left: 0,
      render: (_r: Pembinaan, i: number) => (
        <span style={{ fontWeight: 700, color: '#7A6055' }}>{rowOffset + i + 1}</span>
      ),
    },
    {
      key: 'tgl_pembinaan',
      label: 'Tanggal',
      width: 110,
      sticky: true,
      left: 36,
      render: (r: Pembinaan) => <span style={{ fontWeight: 700 }}>{fmtTgl(r.tgl_pembinaan)}</span>,
    },
    {
      key: 'materi',
      label: 'Tema Materi & Pemateri',
      width: 280,
      sticky: true,
      left: 146,
      sep: true,
      render: (r: Pembinaan) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1A0A00' }}>{r.judul_materi || '—'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>Pemateri: {r.pemateri || '—'}</div>
        </div>
      ),
    },
    {
      key: 'jenis_pembinaan',
      label: 'Jenis Pembinaan',
      width: 160,
      render: (r: Pembinaan) => <span>{r.jenis_pembinaan}</span>,
    },
    {
      key: 'semester',
      label: 'Semester',
      width: 90,
      render: (r: Pembinaan) => (
        <span>{r.semester_label || `Semester ${r.semesterid}`}</span>
      ),
    },
    {
      key: 'wilayah',
      label: 'Wilayah',
      width: 140,
      render: (r: Pembinaan) => <span>{r.nama_wilayah}</span>,
    },
    {
      key: 'kehadiran',
      label: 'Kehadiran',
      width: 130,
      render: (r: Pembinaan) => {
        const pct = r.jumlah_anak > 0 ? Math.round((r.jumlah_hadir / r.jumlah_anak) * 100) : 0;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>
              <span>{r.jumlah_hadir} / {r.jumlah_anak} Anak</span>
              <span style={{ color: '#BF4E02' }}>{pct}%</span>
            </div>
            <div style={{ height: 5, background: '#F2EAE3', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#BF4E02' }} />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.id_pembinaan}
      loading={loading}
      onRowClick={r => router.push(`/pembinaan/${r.id_pembinaan}`)}
      minWidth={910}
    />
  );
}
