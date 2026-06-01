'use client';
import Link from 'next/link';
import { fmtTgl } from '@/lib/utils';
import type { Pembinaan } from '@/types/pembinaan';

interface PembinaanCardProps {
  data: Pembinaan[];
}

export function PembinaanCard({ data }: PembinaanCardProps) {
  return (
    <div className="datagrid-mobile">
      {data.map(r => {
        const pct = r.jumlah_anak > 0 ? Math.round((r.jumlah_hadir / r.jumlah_anak) * 100) : 0;
        return (
          <Link key={r.id_pembinaan} href={`/pembinaan/${r.id_pembinaan}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
              padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7A6055' }}>
                  {fmtTgl(r.tgl_pembinaan)}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#FBF0E8', color: '#BF4E02' }}>
                  {r.semester_label || `Sem ${r.semesterid}`}
                </span>
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', lineHeight: 1.3 }}>
                  {r.judul_materi || '—'}
                </div>
                <div style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
                  Materi: {r.jenis_pembinaan} • {r.pemateri}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F2EAE3', paddingTop: 8, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: '#7A6055' }}>Kehadiran</span>
                  <span style={{ color: '#BF4E02' }}>{r.jumlah_hadir} / {r.jumlah_anak} Hadir ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: '#F2EAE3', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#BF4E02' }} />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
