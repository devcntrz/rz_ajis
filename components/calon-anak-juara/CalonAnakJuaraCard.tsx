'use client';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl, STATUS_COLOR } from '@/lib/utils';
import type { CalonAnakJuaraRow } from '@/types/calon-anak-juara';

interface Props {
  data: CalonAnakJuaraRow[];
  loading?: boolean;
  onPdfSurat: (row: CalonAnakJuaraRow) => void;
  onPdfCv: (row: CalonAnakJuaraRow) => void;
  onPasangDonatur: (row: CalonAnakJuaraRow) => void;
}

export function CalonAnakJuaraCard({ data, loading, onPdfSurat, onPdfCv, onPasangDonatur }: Props) {
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
        Tidak ada Calon Anak Juara.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(r => {
        const [txt, bg] = STATUS_COLOR[r.status_ortu] || ['#7A6055', '#F2EAE3'];
        return (
          <div
            key={r.id_anak}
            style={{
              textAlign: 'left', fontFamily: 'inherit',
              background: '#FFFFFF',
              border: '1.5px solid #F0C4A0',
              borderRadius: 14, padding: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>
              <RowActions
                label={`Aksi untuk ${r.nama_lengkap}`}
                items={[
                  { label: 'Pasang ke Donatur', onClick: () => onPasangDonatur(r) },
                  { label: 'PDF Surat', onClick: () => onPdfSurat(r) },
                  { label: 'PDF CV', onClick: () => onPdfCv(r) },
                ]}
              />
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1A0A00', marginTop: 4 }}>{r.nama_lengkap}</div>
            <div style={{ fontSize: 12, color: '#7A6055', marginTop: 4 }}>
              {r.jenjang_pendidikan || '—'} · Kelas {r.kelas || '—'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <Badge label={r.status_ortu || '—'} color={txt} bg={bg} />
              <Badge
                label={r.status_pinjam === 'y' ? 'Booked' : 'Belum booked'}
                color={r.status_pinjam === 'y' ? '#1A7A45' : '#7A6055'}
                bg={r.status_pinjam === 'y' ? '#E5F5ED' : '#F2EAE3'}
              />
            </div>
            <div style={{ fontSize: 11, color: '#7A6055', marginTop: 8 }}>
              {r.nama_wilayah || '—'} · {r.nama_kantor || '—'} · Terdaftar {fmtTgl(r.tgl_terdaftar)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
