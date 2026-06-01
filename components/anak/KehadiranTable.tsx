'use client';
import { fmtTgl, HADIR_COLOR } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface KehadiranRow {
  id_pembinaan: string;
  tgl_pembinaan: string;
  semesterid: string;
  jenis_pembinaan: string;
  judul_materi: string;
  pemateri: string;
  kehadiran: string;
  keterangan: string;
  membantu_ortu: number;
  pembiasaan_shalat_wajib: number;
  pembiasaan_tilawah: number;
  pembiasaan_sedekah: number;
}

export function KehadiranTable({ data }: { data: KehadiranRow[] }) {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#7A6055', fontSize: 13 }}>
        Belum ada riwayat pembinaan di semester ini.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ minWidth: 700, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F2EAE3', color: '#7A6055', fontWeight: 700 }}>
            <th style={{ padding: 10 }}>Tanggal</th>
            <th style={{ padding: 10 }}>Materi</th>
            <th style={{ padding: 10 }}>Jenis</th>
            <th style={{ padding: 10 }}>Status</th>
            <th style={{ padding: 10, textAlign: 'center' }}>Pembiasaan Mandiri</th>
            <th style={{ padding: 10 }}>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const statusLabel = r.kehadiran === 'y' ? 'Hadir' : (r.keterangan || 'Alfa');
            const statusKey = r.kehadiran === 'y' ? 'hadir' : (r.keterangan?.toLowerCase().includes('izin') ? 'izin' : 'alfa');
            const [txt, bg] = HADIR_COLOR[statusKey] || ['#7A6055', '#F2EAE3'];

            return (
              <tr key={i} style={{ borderBottom: '1px solid #F2EAE3' }}>
                <td style={{ padding: 10, fontWeight: 600 }}>{fmtTgl(r.tgl_pembinaan)}</td>
                <td style={{ padding: 10 }}>
                  <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.judul_materi || '—'}</div>
                  <div style={{ fontSize: 11, color: '#7A6055' }}>Pemateri: {r.pemateri || '—'}</div>
                </td>
                <td style={{ padding: 10 }}>{r.jenis_pembinaan}</td>
                <td style={{ padding: 10 }}>
                  <Badge label={statusLabel} color={txt} bg={bg} />
                </td>
                <td style={{ padding: 10, verticalAlign: 'middle' }}>
                  {r.kehadiran === 'y' ? (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: r.pembiasaan_shalat_wajib ? '#E5F5ED' : '#FDEAEA', color: r.pembiasaan_shalat_wajib ? '#1A7A45' : '#B02020' }}>Shalat</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: r.pembiasaan_tilawah ? '#E5F5ED' : '#FDEAEA', color: r.pembiasaan_tilawah ? '#1A7A45' : '#B02020' }}>Tilawah</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: r.pembiasaan_sedekah ? '#E5F5ED' : '#FDEAEA', color: r.pembiasaan_sedekah ? '#1A7A45' : '#B02020' }}>Sedekah</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: r.membantu_ortu ? '#E5F5ED' : '#FDEAEA', color: r.membantu_ortu ? '#1A7A45' : '#B02020' }}>Bantu Ortu</span>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#7A6055', fontSize: 11 }}>—</div>
                  )}
                </td>
                <td style={{ padding: 10, color: '#7A6055' }}>{r.kehadiran === 'y' ? '—' : (r.keterangan || 'Tanpa Keterangan')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
