'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { AjisSurveyPgListItem } from '@/types/survey-pg';

interface SurveyPgTableProps {
  data: AjisSurveyPgListItem[];
  loading: boolean;
  onEdit: (row: AjisSurveyPgListItem) => void;
  onDelete: (row: AjisSurveyPgListItem) => void;
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

export function SurveyPgTable({ data, loading, onEdit, onDelete, busyId, page, limit }: SurveyPgTableProps) {
  const columns = [
    {
      key: 'aksi', label: 'Aksi', width: 64, sticky: true,
      render: (r: AjisSurveyPgListItem) => (
        <RowActions
          label={`Aksi untuk ${r.namaLengkap ?? r.idAnak}`}
          items={[
            { label: 'Edit', onClick: () => onEdit(r) },
            { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.idSurvey },
          ]}
        />
      ),
    },
    {
      key: 'nama', label: 'Nama Anak', width: 200, sticky: true,
      render: (r: AjisSurveyPgListItem) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.namaLengkap ?? '-'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>{r.idAnak}</div>
        </div>
      ),
    },
    { key: 'jenjang', label: 'Jenjang', width: 90, render: (r: AjisSurveyPgListItem) => r.jenjangPendidikan?.toUpperCase() ?? '-' },
    { key: 'asnaf', label: 'Asnaf', width: 120, render: (r: AjisSurveyPgListItem) => r.asnaf ?? '-' },
    { key: 'wilayah', label: 'Wilayah', width: 150, render: (r: AjisSurveyPgListItem) => r.namaWilayah ?? '-' },
    { key: 'kantor', label: 'Kantor', width: 150, render: (r: AjisSurveyPgListItem) => r.namaKantor ?? '-' },
    { key: 'petugas', label: 'Petugas Survey', width: 150, render: (r: AjisSurveyPgListItem) => r.petugasSurvey ?? '-' },
    { key: 'tgl_survey', label: 'Tgl Survey', width: 120, render: (r: AjisSurveyPgListItem) => fmtTgl(r.tglSurvey) },
    { key: 'hasil', label: 'Hasil Kesimpulan', width: 140, render: (r: AjisSurveyPgListItem) => hasilBadge(r.hasilKesimpulanSurvey) },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => String(r.idSurvey)}
      loading={loading}
      minWidth={totalWidth}
      emptyText="Belum ada data survey."
      rowNumberStart={(page - 1) * limit + 1}
    />
  );
}
