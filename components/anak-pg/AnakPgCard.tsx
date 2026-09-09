'use client';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { calcAge } from '@/lib/utils';
import type { AnakPgListItem } from '@/types/anak-pg';

interface AnakPgCardProps {
  data: AnakPgListItem[];
  loading?: boolean;
  onEdit: (row: AnakPgListItem) => void;
  onDelete: (row: AnakPgListItem) => void;
  onSurvey?: (row: AnakPgListItem) => void;
  busyId?: string | null;
  page: number;
  limit: number;
}

const STATUS_LABEL: Record<string, string> = { caj: 'Calon Anak Juara', aj: 'Anak Juara', non: 'Non Aktif' };

export function AnakPgCard({ data, loading, onEdit, onDelete, onSurvey, busyId, page, limit }: AnakPgCardProps) {
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
        Belum ada data pengajuan beasiswa.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile">
      {data.map((r, i) => (
        <div key={r.idAnak} style={{
          background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
          padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Avatar nama={r.namaLengkap} gender={r.jnsKel ?? undefined} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>No. {rowNumberStart + i} • {r.idAnak}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Badge label={r.aktif ? 'Aktif' : 'Nonaktif'} color={r.aktif ? '#1A7A45' : '#7A6055'} bg={r.aktif ? '#E5F5ED' : '#F2EAE3'} />
                <RowActions
                  label={`Aksi untuk ${r.namaLengkap}`}
                  items={[
                    { label: 'Edit', onClick: () => onEdit(r) },
                    ...(onSurvey ? [{ label: 'Survey', onClick: () => onSurvey(r) }] : []),
                    { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.idAnak },
                  ]}
                />
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 2 }}>{r.namaLengkap}</div>
            <div style={{ fontSize: 12, color: '#7A6055', marginTop: 3 }}>
              {(r.jenjangPendidikan ?? '-').toUpperCase()} Kelas {r.kelas || '—'} • {calcAge(r.tglLahir)} Thn
            </div>
            <div style={{ fontSize: 11, color: '#7A6055', marginTop: 1 }}>
              {r.namaWilayah ?? '-'} • {r.namaKantor ?? '-'}
            </div>
            {r.statusAnakJuara && (
              <div style={{ marginTop: 6 }}>
                <Badge label={STATUS_LABEL[r.statusAnakJuara] ?? r.statusAnakJuara} color="#1A5FA8" bg="#E5EEF8" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
