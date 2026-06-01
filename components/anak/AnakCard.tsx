'use client';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { STATUS_COLOR, calcAge } from '@/lib/utils';
import type { AnakListRow } from '@/types/anak';

interface AnakCardProps {
  data: AnakListRow[];
  rowOffset?: number;
  loading?: boolean;
}

export function AnakCard({ data, rowOffset = 0, loading }: AnakCardProps) {
  if (loading && data.length === 0) {
    return (
      <div className="datagrid-mobile">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 88, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{ padding: 24, textAlign: 'center', color: '#7A6055', fontSize: 14 }}>
        Tidak ada data anak asuh.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile">
      {data.map((r, i) => {
        const [txt, bg] = STATUS_COLOR[r.status_ortu] || ['#7A6055', '#F2EAE3'];
        return (
          <Link key={r.id_anak} href={`/anak/${r.id_anak}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
              padding: 12, display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#7A6055', minWidth: 22 }}>
                #{rowOffset + i + 1}
              </span>
              <Avatar nama={r.nama_lengkap} gender={r.jns_kel} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>
                  <Badge label={r.status_ortu} color={txt} bg={bg} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.nama_lengkap}
                </div>
                <div style={{ fontSize: 12, color: '#7A6055', marginTop: 3 }}>
                  {r.jenjang_pendidikan} Kelas {r.kelas || '—'} • {calcAge(r.tgl_lahir)} Thn
                </div>
                <div style={{ fontSize: 11, color: '#7A6055', marginTop: 1 }}>
                  📍 {r.nama_wilayah}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
