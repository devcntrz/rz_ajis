'use client';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl } from '@/lib/utils';
import type { AjisSurveyPgListItem } from '@/types/survey-pg';

interface SurveyPgCardProps {
  data: AjisSurveyPgListItem[];
  loading?: boolean;
  onEdit: (row: AjisSurveyPgListItem) => void;
  onDelete: (row: AjisSurveyPgListItem) => void;
  busyId?: number | null;
  page: number;
  limit: number;
}

export function SurveyPgCard({ data, loading, onEdit, onDelete, busyId, page, limit }: SurveyPgCardProps) {
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
        const layak = r.hasilKesimpulanSurvey?.toLowerCase() === 'layak';
        return (
          <div key={r.idSurvey} style={{
            background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
            padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <Avatar nama={r.namaLengkap ?? r.idAnak} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>No. {rowNumberStart + i} • {fmtTgl(r.tglSurvey)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {r.hasilKesimpulanSurvey && (
                    <Badge
                      label={r.hasilKesimpulanSurvey}
                      color={layak ? '#1A7A45' : '#B02020'}
                      bg={layak ? '#E5F5ED' : '#FDEAEA'}
                    />
                  )}
                  <RowActions
                    label={`Aksi untuk ${r.namaLengkap ?? r.idAnak}`}
                    items={[
                      { label: 'Edit', onClick: () => onEdit(r) },
                      { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.idSurvey },
                    ]}
                  />
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 2 }}>
                {r.namaLengkap ?? '-'}
              </div>
              <div style={{ fontSize: 12, color: '#7A6055', marginTop: 3 }}>
                {r.namaWilayah ?? '-'} • {r.namaKantor ?? '-'}
              </div>
              <div style={{ fontSize: 11, color: '#7A6055', marginTop: 3 }}>
                Petugas: {r.petugasSurvey ?? '-'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
