'use client';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { STATUS_COLOR, calcAge } from '@/lib/utils';
import { anakFotoUrl } from '@/lib/anakFotoUrl';
import { CheckCircle2, XCircle } from 'lucide-react';
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
      render: (r: AnakListRow) => {
        const url = anakFotoUrl(r.foto);
        return url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={url} alt={r.nama_lengkap} width={30} height={30} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
          : <Avatar nama={r.nama_lengkap} gender={r.jns_kel} size={30} />;
      },
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
      width: 200,
      sticky: true,
      left: 176,
      sep: true,
      render: (r: AnakListRow) => (
        <span style={{ fontWeight: 800, fontSize: 13, color: '#1A0A00' }}>{r.nama_lengkap}</span>
      ),
    },
    {
      key: 'nama_panggilan',
      label: 'Panggilan',
      width: 110,
      render: (r: AnakListRow) => <span>{r.nama_panggilan || '—'}</span>,
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
      key: 'jenjang_pendidikan',
      label: 'Jenjang',
      width: 90,
      render: (r: AnakListRow) => <span>{r.jenjang_pendidikan || '—'}</span>,
    },
    {
      key: 'kelas',
      label: 'Kelas',
      width: 70,
      render: (r: AnakListRow) => <span>{r.kelas || '—'}</span>,
    },
    {
      key: 'nama_sekolah',
      label: 'Sekolah',
      width: 180,
      render: (r: AnakListRow) => <span>{r.nama_sekolah || '—'}</span>,
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
      key: 'nama_wilayah',
      label: 'Wilayah',
      width: 160,
      render: (r: AnakListRow) => <span>{r.nama_wilayah || '—'}</span>,
    },
    {
      key: 'nama_kantor',
      label: 'Kantor',
      width: 140,
      render: (r: AnakListRow) => <span>{r.nama_kantor || '—'}</span>,
    },
    {
      key: 'foto',
      label: 'Foto',
      width: 90,
      align: 'center' as const,
      render: (r: AnakListRow) => (
        anakFotoUrl(r.foto)
          ? <Badge label="Ada" color="#1A7A45" bg="#E5F5ED" icon={CheckCircle2} />
          : <Badge label="Belum" color="#B02020" bg="#FDEAEA" icon={XCircle} />
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      width: 64,
      align: 'center' as const,
      render: (r: AnakListRow) => (
        <RowActions
          label={`Aksi untuk ${r.nama_lengkap}`}
          items={[
            { label: 'Edit', onClick: () => router.push(`/anak/${r.id_anak}?edit=1`) },
            { label: 'Survey', onClick: () => router.push(`/survey?id_anak=${encodeURIComponent(r.id_anak)}`) },
          ]}
        />
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
      minWidth={1500}
    />
  );
}
