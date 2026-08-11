'use client';
import { Btn } from '@/components/ui/Btn';
import { fmtTgl } from '@/lib/utils';
import type { AjuanGantiAnak } from '@/types/ajuan';

interface AjuanTableProps {
  data:       AjuanGantiAnak[];
  loading:    boolean;
  rowOffset?: number;
  onDelete:   (row: AjuanGantiAnak) => void;
  onUlangi:   (row: AjuanGantiAnak) => void;
  onEksekusi: (row: AjuanGantiAnak) => void;
}

function rowBg(row: AjuanGantiAnak): string {
  if (row.status_eksekusi === 'y') return '#E5EEF8';
  if (row.approve_funding === 'n') return '#FDEAEA';
  if (row.approve_funding === 'y') return '#E5F5ED';
  return '#FFFFFF';
}

function approveLabel(v: string) {
  if (v === 'y') return 'Disetujui';
  if (v === 'n') return 'Ditolak';
  return 'Pending';
}

export function AjuanTable({
  data, loading, rowOffset = 0, onDelete, onUlangi, onEksekusi,
}: AjuanTableProps) {
  if (loading) {
    return (
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1.5px solid #F0C4A0', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ padding: '14px 18px', borderBottom: '1px solid #F2EAE3' }}>
            <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1.5px solid #F0C4A0', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1400 }}>
          <thead>
            <tr style={{ background: '#FBF0E8' }}>
              {['#', 'Status', 'Tgl Ajuan', 'Tgl Approve', 'Tgl Eksekusi', 'Kantor', 'Donatur', 'Anak Asal', 'Anak Pengganti', 'Alasan', 'Saldo', 'Aksi'].map(h => (
                <th key={h} style={{
                  fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase',
                  letterSpacing: 0.5, padding: '10px 12px', whiteSpace: 'nowrap', textAlign: 'left',
                  borderBottom: '1.5px solid #F0C4A0', fontFamily: 'inherit',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: 40, color: '#7A6055', fontSize: 14 }}>
                  Tidak ada ajuan pergantian.
                </td>
              </tr>
            )}
            {data.map((r, i) => {
              const bg = rowBg(r);
              const canEksekusi = r.approve_funding === 'y' && r.status_eksekusi !== 'y';
              const canUlangi = r.status_eksekusi !== 'y';
              const canDelete = r.status_eksekusi !== 'y';
              return (
                <tr key={r.id_ajuan} style={{ background: bg }}>
                  <td style={td}>{rowOffset + i + 1}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 700, fontSize: 11 }}>
                      {r.status_eksekusi === 'y' ? 'Dieksekusi' : approveLabel(r.approve_funding)}
                    </div>
                  </td>
                  <td style={td}>{fmtTgl(r.tgl_ajuan)}</td>
                  <td style={td}>{fmtTgl(r.tgl_approve_funding)}</td>
                  <td style={td}>{fmtTgl(r.tgl_eksekusi)}</td>
                  <td style={td}>{r.nama_kantor || r.id_kantor}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{r.nama_donatur}</div>
                    <div style={{ fontSize: 11, color: '#7A6055' }}>{r.id_donatur}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{r.nama_anak_asal}</div>
                    <div style={{ fontSize: 11, color: '#7A6055' }}>{r.id_anak}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{r.nama_anak_pengganti}</div>
                    <div style={{ fontSize: 11, color: '#7A6055' }}>{r.id_anak_pengganti}</div>
                  </td>
                  <td style={{ ...td, maxWidth: 180, whiteSpace: 'normal' }}>{r.alasan_pergantian || '—'}</td>
                  <td style={td}>{Number(r.pindah_saldo || 0).toLocaleString('id-ID')}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const td: React.CSSProperties = {
  fontSize: 12, color: '#1A0A00', padding: '10px 12px',
  whiteSpace: 'nowrap', fontFamily: 'inherit', verticalAlign: 'top',
};
