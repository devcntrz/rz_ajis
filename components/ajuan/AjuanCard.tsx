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

function cardTone(row: AjuanGantiAnak): { color: string; border: string } {
  if (row.status_eksekusi === 'y') return { color: '#1A5FA8', border: '#1A5FA840' };
  if (row.approve_funding === 'n') return { color: '#B02020', border: '#B0202040' };
  if (row.approve_funding === 'y') return { color: '#1A7A45', border: '#1A7A4540' };
  return { color: '#1A0A00', border: '#F0C4A0' };
}

function approveLabel(v: string) {
  if (v === 'y') return 'Disetujui';
  if (v === 'n') return 'Ditolak';
  return 'Pending';
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
        const canEksekusi = r.status_eksekusi !== 'y';
        const canUlangi = r.status_eksekusi !== 'y';
        const canDelete = r.status_eksekusi !== 'y';
        const tone = cardTone(r);
        return (
          <div
            key={r.id_ajuan}
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${tone.border}`,
              borderRadius: 14,
              padding: 12,
              color: tone.color,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              {fmtTgl(r.tgl_ajuan)} · {r.nama_kantor}
            </div>
            {/* Approval and execution are independent — show both, never one masking the other. */}
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>
              Approve: {approveLabel(r.approve_funding)}
              {' · '}
              Eksekusi: {r.status_eksekusi === 'y' ? 'Sudah' : 'Belum'}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>
              {r.nama_anak_asal} → {r.nama_anak_pengganti}
            </div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>
              Donatur: {r.nama_donatur}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
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
