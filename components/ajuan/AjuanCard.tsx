'use client';
import { Btn } from '@/components/ui/Btn';
import { fmtTgl } from '@/lib/utils';
import type { AjuanGantiAnak } from '@/types/ajuan';

interface AjuanCardProps {
  data: AjuanGantiAnak[];
  loading?: boolean;
  onDelete:   (row: AjuanGantiAnak) => void;
  onUlangi:   (row: AjuanGantiAnak) => void;
  onEksekusi: (row: AjuanGantiAnak) => void;
}

function cardBg(row: AjuanGantiAnak): string {
  if (row.status_eksekusi === 'y') return '#E5EEF8';
  if (row.approve_funding === 'n') return '#FDEAEA';
  if (row.approve_funding === 'y') return '#E5F5ED';
  return '#FFFFFF';
}

export function AjuanCard({ data, loading, onDelete, onUlangi, onEksekusi }: AjuanCardProps) {
  if (loading && data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{ padding: 24, textAlign: 'center', color: '#7A6055' }}>
        Tidak ada ajuan pergantian.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(r => {
        const canEksekusi = r.approve_funding === 'y' && r.status_eksekusi !== 'y';
        const canUlangi = r.status_eksekusi !== 'y';
        const canDelete = r.status_eksekusi !== 'y';
        return (
          <div
            key={r.id_ajuan}
            style={{
              background: cardBg(r),
              border: '1.5px solid #F0C4A0',
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 11, color: '#7A6055' }}>
              {fmtTgl(r.tgl_ajuan)} · {r.nama_kantor}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 4 }}>
              {r.nama_anak_asal} → {r.nama_anak_pengganti}
            </div>
            <div style={{ fontSize: 12, color: '#7A6055', marginTop: 4 }}>
              Donatur: {r.nama_donatur}
            </div>
            <div style={{ fontSize: 12, color: '#1A0A00', marginTop: 4 }}>
              {r.alasan_pergantian || '—'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <Btn size="sm" variant="primary" disabled={!canEksekusi} onClick={() => onEksekusi(r)}>
                Eksekusi
              </Btn>
              <Btn size="sm" variant="outline" disabled={!canUlangi} onClick={() => onUlangi(r)}>
                Ulangi
              </Btn>
              <Btn size="sm" variant="danger" disabled={!canDelete} onClick={() => onDelete(r)}>
                Hapus
              </Btn>
            </div>
          </div>
        );
      })}
    </div>
  );
}
