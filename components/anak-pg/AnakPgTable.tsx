'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { AnakPgListItem } from '@/types/anak-pg';

interface AnakPgTableProps {
  data: AnakPgListItem[];
  loading: boolean;
  onEdit: (row: AnakPgListItem) => void;
  onDelete: (row: AnakPgListItem) => void;
  onSurvey?: (row: AnakPgListItem) => void;
  busyId?: string | null;
  page: number;
  limit: number;
}

const STATUS_LABEL: Record<string, string> = { caj: 'Calon Anak Juara', aj: 'Anak Juara', non: 'Non Aktif' };

export function AnakPgTable({ data, loading, onEdit, onDelete, onSurvey, busyId, page, limit }: AnakPgTableProps) {
  const columns = [
    {
      key: 'aksi', label: 'Aksi', width: 64, sticky: true,
      render: (r: AnakPgListItem) => (
        <RowActions
          label={`Aksi untuk ${r.namaLengkap}`}
          items={[
            { label: 'Edit', onClick: () => onEdit(r) },
            ...(onSurvey ? [{ label: 'Survey', onClick: () => onSurvey(r) }] : []),
            { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.idAnak },
          ]}
        />
      ),
    },
    {
      key: 'nama_lengkap', label: 'Nama Anak', width: 220, sticky: true,
      render: (r: AnakPgListItem) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.namaLengkap}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.idAnak}</div>
        </div>
      ),
    },
    { key: 'jns_kel', label: 'JK', width: 60, render: (r: AnakPgListItem) => (r.jnsKel === 'l' ? 'L' : r.jnsKel === 'p' ? 'P' : '-') },
    { key: 'jenjang', label: 'Jenjang', width: 90, render: (r: AnakPgListItem) => r.jenjangPendidikan?.toUpperCase() ?? '-' },
    { key: 'kelas', label: 'Kelas', width: 80, render: (r: AnakPgListItem) => r.kelas ?? '-' },
    { key: 'sekolah', label: 'Sekolah', width: 200, render: (r: AnakPgListItem) => r.namaSekolah ?? '-' },
    { key: 'asnaf', label: 'Asnaf', width: 100, render: (r: AnakPgListItem) => r.asnaf ?? '-' },
    {
      key: 'status_anak_juara', label: 'Status', width: 150,
      render: (r: AnakPgListItem) => r.statusAnakJuara
        ? <Badge label={STATUS_LABEL[r.statusAnakJuara] ?? r.statusAnakJuara} color="#1A5FA8" bg="#E5EEF8" />
        : <span style={{ color: '#7A6055' }}>-</span>,
    },
    { key: 'wilayah', label: 'Wilayah', width: 150, render: (r: AnakPgListItem) => r.namaWilayah ?? '-' },
    { key: 'kantor', label: 'Kantor', width: 150, render: (r: AnakPgListItem) => r.namaKantor ?? '-' },
    { key: 'tgl_lahir', label: 'Tgl Lahir', width: 120, render: (r: AnakPgListItem) => fmtTgl(r.tglLahir) },
    { key: 'tgl_terdaftar', label: 'Tgl Daftar', width: 120, render: (r: AnakPgListItem) => fmtTgl(r.tglTerdaftar) },
    {
      key: 'aktif', label: 'Aktif', width: 90,
      render: (r: AnakPgListItem) => (
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
      rowKey={r => r.idAnak}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Belum ada data pengajuan beasiswa."
      rowNumberStart={(page - 1) * limit + 1}
    />
  );
}
