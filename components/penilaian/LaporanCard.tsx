'use client';
import { Card, CardHead } from '@/components/ui/Card';
import { NilaiBadge } from '@/components/ui/NilaiBadge';
import type { PenilaianSummary } from '@/types/penilaian';

interface LaporanCardProps {
  data: PenilaianSummary & { nama_wilayah: string; nama_kantor: string };
}

export function LaporanCard({ data }: LaporanCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profil Header */}
      <Card>
        <CardHead title="Profil Laporan Hasil Belajar" />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700, textTransform: 'uppercase' }}>Nama Anak</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A0A00', marginTop: 2 }}>{data.nama_anak}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700, textTransform: 'uppercase' }}>ID Anak</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#BF4E02', marginTop: 2 }}>{data.id_anak}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700, textTransform: 'uppercase' }}>Wilayah & Kantor</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A0A00', marginTop: 2 }}>{data.nama_wilayah} ({data.nama_kantor})</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700, textTransform: 'uppercase' }}>Semester</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A0A00', marginTop: 2 }}>Semester {data.semesterid}</div>
          </div>
        </div>
      </Card>

      {/* Aspek Cerdas */}
      <Card>
        <CardHead title="I. Aspek Cerdas (Pendidikan & Hafalan)" />
        <div style={{ overflowX: 'auto', padding: 10 }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Item Evaluasi</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Target Minimal</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Kondisi Awal (Baseline)</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Perkembangan Capaian</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center', width: 140 }}>Hasil Akhir</th>
              </tr>
            </thead>
            <tbody>
              {data.aspek_cerdas.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F2EAE3' }}>
                  <td style={{ padding: 10, fontWeight: 700, color: '#1A0A00' }}>{r.aspek}</td>
                  <td style={{ padding: 10 }}>{r.target || '—'}</td>
                  <td style={{ padding: 10 }}>{r.kondisi_awal || '—'}</td>
                  <td style={{ padding: 10 }}>{r.perkembangan_capaian || '—'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <NilaiBadge nilai={r.hasil_akhir} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Aspek Mandiri */}
      <Card>
        <CardHead title="II. Aspek Mandiri (Karakter & Pembiasaan)" />
        <div style={{ overflowX: 'auto', padding: 10 }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Item Aspek Mandiri</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Target Minimal</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center', width: 150 }}>Nilai Capaian (%)</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center', width: 140 }}>Hasil Akhir</th>
              </tr>
            </thead>
            <tbody>
              {data.aspek_mandiri.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F2EAE3' }}>
                  <td style={{ padding: 10, fontWeight: 700, color: '#1A0A00' }}>{r.aspek}</td>
                  <td style={{ padding: 10 }}>{r.target || '100%'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{r.nilai_capaian}%</span>
                      <div style={{ width: 60, height: 5, background: '#F2EAE3', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${r.nilai_capaian}%`, background: '#BF4E02' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <NilaiBadge nilai={r.hasil_akhir} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Catatan Pembina & Suara Anak */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <Card>
          <CardHead title="Catatan & Rekomendasi Pembina" />
          <div style={{ padding: 16, fontSize: 13, color: '#1A0A00', lineHeight: 1.5, minHeight: 90 }}>
            {data.catatan || <span style={{ color: '#7A6055', fontStyle: 'italic' }}>Tidak ada catatan.</span>}
          </div>
        </Card>

        <Card>
          <CardHead title="Suara Anak Juara (Impian / Cita-Cita)" />
          <div style={{ padding: 16, fontSize: 13, color: '#1A0A00', lineHeight: 1.5, minHeight: 90 }}>
            {data.suara_anak || <span style={{ color: '#7A6055', fontStyle: 'italic' }}>Tidak ada catatan suara anak.</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}
