'use client';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import type { AjisWilayahPgListItem } from '@/types/wilayah-pg';

interface WilayahPgCardProps {
  data: AjisWilayahPgListItem[];
  loading?: boolean;
  onEdit: (row: AjisWilayahPgListItem) => void;
  onDelete: (row: AjisWilayahPgListItem) => void;
  canManage: boolean;
  canDelete: boolean;
  busyId?: number | null;
  page: number;
  limit: number;
}

export function WilayahPgCard({ data, loading, onEdit, onDelete, canManage, canDelete, busyId, page, limit }: WilayahPgCardProps) {
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
        Belum ada data wilayah.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile">
      {data.map((r, i) => (
        <div key={r.idWilayahPembinaan} style={{
          background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
          padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>No. {rowNumberStart + i} • {r.namaKantor ?? '-'}</span>
              {canManage && (
                <RowActions
                  label={`Aksi untuk ${r.namaWilayah}`}
                  items={[
                    { label: 'Edit', onClick: () => onEdit(r) },
                    ...(canDelete ? [{ label: 'Hapus', onClick: () => onDelete(r), danger: true, disabled: busyId === r.idWilayahPembinaan }] : []),
                  ]}
                />
              )}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 2 }}>{r.namaWilayah}</div>
            <div style={{ fontSize: 12, color: '#7A6055', marginTop: 3 }}>
              {r.alamatWilayah ?? '-'}
            </div>
            <div style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
              {[r.namaKecamatan, r.namaKabupaten].filter(Boolean).join(', ') || '-'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {r.statusApprove === 'y' && <Badge label="Approved" color="#1A7A45" bg="#E5F5ED" />}
              {r.statusApprove === 't' && <Badge label="Pending" color="#B87800" bg="#FDF4DC" />}
              {r.aktif
                ? <Badge label="Aktif" color="#1A7A45" bg="#E5F5ED" />
                : <Badge label="Nonaktif" color="#B02020" bg="#FDEAEA" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
