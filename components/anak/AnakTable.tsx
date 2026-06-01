'use client';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { STATUS_COLOR, calcAge } from '@/lib/utils';
import type { AnakListRow } from '@/types/anak';

interface AnakTableProps {
  data:      AnakListRow[];
  loading:   boolean;
  rowOffset?: number;
}

export function AnakTable({ data, loading, rowOffset = 0 }: AnakTableProps) {
  const router = useRouter();

  const columns = [
    {
      key: 'no',
      label: '#',
      width: 36,
      sticky: true,
      left: 0,
      render: (_r: AnakListRow, i: number) => (
        <span style={{ fontWeight: 700, color: '#7A6055' }}>{rowOffset + i + 1}</span>
      ),
    },
    {
      key: 'avatar',
      label: '',
      width: 44,
      sticky: true,
      left: 36,
      render: (r: AnakListRow) => <Avatar nama={r.nama_lengkap} gender={r.jns_kel} size={30} />,
    },
    {
      key: 'id_anak',
      label: 'ID Anak',
      width: 100,
      sticky: true,
      left: 76,
      render: (r: AnakListRow) => <span style={{ fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>,
    },
    {
      key: 'nama_lengkap',
      label: 'Nama Lengkap',
      width: 220,
      sticky: true,
      left: 176,
      sep: true,
      render: (r: AnakListRow) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1A0A00' }}>{r.nama_lengkap}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>Panggilan: {r.nama_panggilan || '—'}</div>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'JK',
      width: 50,
      render: (r: AnakListRow) => <span>{r.jns_kel?.toUpperCase() || '—'}</span>,
    },
    {
      key: 'usia',
      label: 'Usia',
      width: 70,
      render: (r: AnakListRow) => <span>{calcAge(r.tgl_lahir)} Tahun</span>,
    },
    {
      key: 'sekolah',
      label: 'Pendidikan',
      width: 180,
      render: (r: AnakListRow) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.jenjang_pendidikan} Kelas {r.kelas || '—'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.nama_sekolah || '—'}</div>
        </div>
      ),
    },
    {
      key: 'status_ortu',
      label: 'Status',
      width: 110,
      render: (r: AnakListRow) => {
        const [txt, bg] = STATUS_COLOR[r.status_ortu] || ['#7A6055', '#F2EAE3'];
        return <Badge label={r.status_ortu} color={txt} bg={bg} />;
      },
    },
    {
      key: 'wilayah',
      label: 'Wilayah & Kantor',
      width: 180,
      render: (r: AnakListRow) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.nama_wilayah}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.nama_kantor}</div>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.id_anak}
      loading={loading}
      onRowClick={r => router.push(`/anak/${r.id_anak}`)}
      minWidth={950}
    />
  );
}
