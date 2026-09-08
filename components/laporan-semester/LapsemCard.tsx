'use client';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import type { LapsemRow } from '@/types/laporan-semester';

interface LapsemCardProps {
  data:       LapsemRow[];
  loading?:   boolean;
  onPreview:  (row: LapsemRow) => void;
  onApprove:  (row: LapsemRow) => void;
  approvingId?: string | null;
  canApprove: boolean;
}

function isApproved(r: LapsemRow) {
  return !!r.id_program_postgree;
}

export function LapsemCard({ data, loading, onPreview, onApprove, approvingId, canApprove }: LapsemCardProps) {
  if (loading && data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 96, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{ padding: 24, textAlign: 'center', color: '#7A6055', fontSize: 14 }}>
        Tidak ada data laporan semester.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(r => (
        <div
          key={r.laporanid}
          style={{
            background: '#FFFFFF', border: '1.5px solid #F0C4A0',
            borderRadius: 14, padding: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>{r.laporanid}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge
                label={isApproved(r) ? 'Sudah Approve' : 'Belum Approve'}
                color={isApproved(r) ? '#1A7A45' : '#B02020'}
                bg={isApproved(r) ? '#E5F5ED' : '#FDEAEA'}
              />
              <RowActions
                label={`Aksi untuk ${r.pm_nama_lengkap || r.nama_lengkap}`}
                items={[
                  { label: 'Preview PDF', onClick: () => onPreview(r) },
                  {
                    label: isApproved(r) ? 'Approve Ulang' : 'Approve',
                    onClick: () => onApprove(r),
                    disabled: !canApprove || approvingId === r.laporanid,
                  },
                ]}
              />
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 4 }}>
            {r.pm_nama_lengkap || r.nama_lengkap || '—'} · {r.id_anak}
          </div>
          <div style={{ fontSize: 12, color: '#7A6055', marginTop: 4 }}>
            Donatur: {r.donatur_nama || '—'}
          </div>
          <div style={{ fontSize: 11, color: '#7A6055', marginTop: 2 }}>
            {r.nama_semester || r.semesterid || '—'} · {r.nama_kantor || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}
