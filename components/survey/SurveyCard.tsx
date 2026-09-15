'use client';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { AjisSurveyListItem } from '@/types/survey';

interface SurveyCardProps {
  data: AjisSurveyListItem[];
  loading?: boolean;
  onEdit: (row: AjisSurveyListItem) => void;
  onDelete: (row: AjisSurveyListItem) => void;
  busyId?: number | null;
  page: number;
  limit: number;
}

export function SurveyCard({ data, loading, onEdit, onDelete, busyId, page, limit }: SurveyCardProps) {
  const rowNumberStart = (page - 1) * limit + 1;
  if (loading && data.length === 0) {
    return (
      <div className="datagrid-mobile">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 96, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{ padding: 24, textAlign: 'center', color: '#7A6055', fontSize: 14 }}>
        Belum ada data survey.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile">
      {data.map((r, i) => {
        const layak = r.hasil_kesimpulan_survey?.toLowerCase() === 'layak';
        return (
          <div key={r.id_survey} style={{
            background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
            padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <Avatar nama={r.nama_lengkap ?? r.id_anak} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>No. {rowNumberStart + i} • {fmtTgl(r.tgl_survey)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {r.hasil_kesimpulan_survey && (
                    <Badge
                      label={r.hasil_kesimpulan_survey}
                      color={layak ? '#1A7A45' : '#B02020'}
                      bg={layak ? '#E5F5ED' : '#FDEAEA'}
                    />
                  )}
                  <RowActions
                    label={`Aksi untuk ${r.nama_lengkap ?? r.id_anak}`}
                    items={[
                      { label: 'Edit', onClick: () => onEdit(r) },
                      { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.id_survey },
                    ]}
                  />
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 2 }}>
                {r.nama_lengkap ?? '-'}
              </div>
              <div style={{ fontSize: 12, color: '#7A6055', marginTop: 3 }}>
                {r.nama_wilayah ?? '-'} • {r.nama_kantor ?? '-'}
              </div>
              <div style={{ fontSize: 11, color: '#7A6055', marginTop: 3 }}>
                Petugas: {r.petugas_survey ?? '-'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
