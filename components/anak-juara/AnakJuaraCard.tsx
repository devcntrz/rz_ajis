'use client';
import { Badge } from '@/components/ui/Badge';
import type { AnakJuaraRow } from '@/types/anak-juara';

interface AnakJuaraCardProps {
  data: AnakJuaraRow[];
  loading?: boolean;
  selectedId?: string | null;
  onSelect: (row: AnakJuaraRow) => void;
}

export function AnakJuaraCard({ data, loading, selectedId, onSelect }: AnakJuaraCardProps) {
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
        Tidak ada data pemasangan Anak Juara.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(r => {
        const selected = selectedId === r.id_pemasangan_baru;
        return (
          <button
            key={r.id_pemasangan_baru}
            type="button"
            onClick={() => onSelect(r)}
            style={{
              textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              background: selected ? '#FBF0E8' : '#FFFFFF',
              border: selected ? '2px solid #BF4E02' : '1.5px solid #F0C4A0',
              borderRadius: 14, padding: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>
              <Badge
                label={r.status_pasangan === 'y' ? 'Aktif' : 'Nonaktif'}
                color={r.status_pasangan === 'y' ? '#1A7A45' : '#7A6055'}
                bg={r.status_pasangan === 'y' ? '#E5F5ED' : '#F2EAE3'}
              />
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 4 }}>
              {r.nama_anak}
            </div>
            <div style={{ fontSize: 12, color: '#7A6055', marginTop: 4 }}>
              Donatur: {r.nama_donatur || '—'}
            </div>
            <div style={{ fontSize: 11, color: '#7A6055', marginTop: 2 }}>
              {r.program_donasi || '—'} · {r.nama_wilayah || '—'}
            </div>
          </button>
        );
      })}
    </div>
  );
}
