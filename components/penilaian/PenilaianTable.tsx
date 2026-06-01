'use client';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Btn } from '@/components/ui/Btn';
import { Edit2, Eye, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface PenilaianRow {
  id_anak:            string;
  nama_lengkap:       string;
  jenjang_pendidikan: string;
  nama_wilayah:       string;
  nama_kantor:        string;
  record_count:       number;
  nilai_capaian_avg:  number;
}

interface PenilaianTableProps {
  data:       PenilaianRow[];
  loading:    boolean;
  semester:   string;
  onSync:     (idAnak: string) => Promise<void>;
}

export function PenilaianTable({ data, loading, semester, onSync }: PenilaianTableProps) {
  const router = useRouter();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const columns = [
    {
      key: 'id_anak',
      label: 'ID Anak',
      width: 100,
      sticky: true,
      left: 0,
      render: (r: PenilaianRow) => <span style={{ fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>,
    },
    {
      key: 'nama_lengkap',
      label: 'Nama Anak',
      width: 200,
      sticky: true,
      left: 100,
      sep: true,
      render: (r: PenilaianRow) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1A0A00' }}>{r.nama_lengkap}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.jenjang_pendidikan}</div>
        </div>
      ),
    },
    {
      key: 'wilayah',
      label: 'Wilayah',
      width: 150,
      render: (r: PenilaianRow) => <span>{r.nama_wilayah}</span>,
    },
    {
      key: 'status',
      label: 'Status Penilaian',
      width: 140,
      render: (r: PenilaianRow) => {
        const hasData = r.record_count > 0;
        return (
          <Badge
            label={hasData ? 'Sudah Diisi' : 'Belum Diisi'}
            color={hasData ? '#1A7A45' : '#B02020'}
            bg={hasData ? '#E5F5ED' : '#FDEAEA'}
          />
        );
      },
    },
    {
      key: 'rata_rata',
      label: 'Rata-Rata Capaian',
      width: 150,
      render: (r: PenilaianRow) => {
        if (r.record_count === 0) return <span style={{ color: '#7A6055' }}>—</span>;
        const avg = Math.round(Number(r.nilai_capaian_avg));
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, color: '#BF4E02' }}>{avg}%</span>
            <div style={{ width: 60, height: 5, background: '#F2EAE3', borderRadius: 9, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${avg}%`, background: '#BF4E02' }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'aksi',
      label: 'Pilihan Aksi',
      width: 250,
      render: (r: PenilaianRow) => {
        const hasData = r.record_count > 0;
        const isSyncing = syncingId === r.id_anak;

        return (
          <div style={{ display: 'flex', gap: 6 }}>
            {hasData ? (
              <>
                <Btn
                  onClick={() => router.push(`/penilaian/${r.id_anak}/${semester}`)}
                  variant="outline"
                  size="sm"
                >
                  <Eye size={12} />
                  <span>Lihat</span>
                </Btn>
                <Btn
                  onClick={() => router.push(`/penilaian/${r.id_anak}/${semester}/edit`)}
                  variant="outline"
                  size="sm"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </Btn>
              </>
            ) : (
              <Btn
                onClick={async () => {
                  setSyncingId(r.id_anak);
                  await onSync(r.id_anak);
                  setSyncingId(null);
                }}
                disabled={isSyncing}
                variant="primary"
                size="sm"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync & Isi'}</span>
              </Btn>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.id_anak}
      loading={loading}
      minWidth={940}
    />
  );
}
