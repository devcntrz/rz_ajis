'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { AjisSurveyListItem } from '@/types/survey';

interface SurveyTableProps {
  data: AjisSurveyListItem[];
  loading: boolean;
  onEdit: (row: AjisSurveyListItem) => void;
  onDelete: (row: AjisSurveyListItem) => void;
  busyId?: number | null;
  page: number;
  limit: number;
}

function hasilBadge(hasil: string | null) {
  if (!hasil) return <span style={{ color: '#7A6055' }}>-</span>;
  const layak = hasil.toLowerCase() === 'layak';
  return (
    <Badge
      label={hasil}
      color={layak ? '#1A7A45' : '#B02020'}
      bg={layak ? '#E5F5ED' : '#FDEAEA'}
    />
  );
}

export function SurveyTable({ data, loading, onEdit, onDelete, busyId, page, limit }: SurveyTableProps) {
  const columns = [
    {
      key: 'aksi', label: 'Aksi', width: 64, sticky: true,
      render: (r: AjisSurveyListItem) => (
        <RowActions
          label={`Aksi untuk ${r.nama_lengkap ?? r.id_anak}`}
          items={[
            { label: 'Edit', onClick: () => onEdit(r) },
            { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.id_survey },
          ]}
        />
      ),
    },
    {
      key: 'nama', label: 'Nama Anak', width: 200, sticky: true,
      render: (r: AjisSurveyListItem) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.nama_lengkap ?? '-'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.id_anak}</div>
        </div>
      ),
    },
    { key: 'jenjang', label: 'Jenjang', width: 90, render: (r: AjisSurveyListItem) => r.jenjang_pendidikan?.toUpperCase() ?? '-' },
    { key: 'asnaf', label: 'Asnaf', width: 120, render: (r: AjisSurveyListItem) => r.asnaf ?? '-' },
    { key: 'wilayah', label: 'Wilayah', width: 150, render: (r: AjisSurveyListItem) => r.nama_wilayah ?? '-' },
    { key: 'kantor', label: 'Kantor', width: 150, render: (r: AjisSurveyListItem) => r.nama_kantor ?? '-' },
    { key: 'petugas', label: 'Petugas Survey', width: 150, render: (r: AjisSurveyListItem) => r.petugas_survey ?? '-' },
    { key: 'tgl_survey', label: 'Tgl Survey', width: 120, render: (r: AjisSurveyListItem) => fmtTgl(r.tgl_survey) },
    { key: 'hasil', label: 'Hasil Kesimpulan', width: 140, render: (r: AjisSurveyListItem) => hasilBadge(r.hasil_kesimpulan_survey) },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => String(r.id_survey)}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Belum ada data survey."
      rowNumberStart={(page - 1) * limit + 1}
    />
  );
}
