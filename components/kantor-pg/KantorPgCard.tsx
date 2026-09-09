'use client';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import type { AjisKantorPgListItem } from '@/types/kantor-pg';

interface KantorPgCardProps {
  data: AjisKantorPgListItem[];
  loading?: boolean;
  onEdit: (row: AjisKantorPgListItem) => void;
  onDelete: (row: AjisKantorPgListItem) => void;
  canManage: boolean;
  busyId?: number | null;
  page: number;
  limit: number;
}

export function KantorPgCard({ data, loading, onEdit, onDelete, canManage, busyId, page, limit }: KantorPgCardProps) {
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
        Belum ada data kantor.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile">
      {data.map((r, i) => (
        <div key={r.id} style={{
          background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
          padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>No. {rowNumberStart + i} • {r.oid}</span>
              {canManage && (
                <RowActions
                  label={`Aksi untuk ${r.kantor ?? r.oid}`}
                  items={[
                    { label: 'Edit', onClick: () => onEdit(r) },
                    { label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.id },
                  ]}
                />
              )}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 2 }}>{r.kantor ?? '-'}</div>
            <div style={{ fontSize: 12, color: '#7A6055', marginTop: 3 }}>
              {r.alamat ?? '-'}{r.noTelp ? ` • ${r.noTelp}` : ''}
            </div>
            {r.jenis && (
              <div style={{ marginTop: 6 }}>
                <Badge label={r.jenis} color="#1A5FA8" bg="#E5EEF8" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
