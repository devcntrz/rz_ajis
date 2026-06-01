'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea, Sel } from '@/components/ui/Input';
import { Btn } from '@/components/ui/Btn';
import { NILAI_OPTIONS } from '@/lib/utils';
import type { PenilaianSummary } from '@/types/penilaian';

interface PenilaianEditFormProps {
  initialData: PenilaianSummary & { nama_wilayah: string; nama_kantor: string };
  semester:    string;
}

export function PenilaianEditForm({ initialData, semester }: PenilaianEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [aspekCerdas, setAspekCerdas] = useState(initialData.aspek_cerdas);
  const [aspekMandiri, setAspekMandiri] = useState(initialData.aspek_mandiri);
  const [catatan, setCatatan] = useState(initialData.catatan || '');
  const [suaraAnak, setSuaraAnak] = useState(initialData.suara_anak || '');
  const [submitting, setSubmitting] = useState(false);

  function handleCerdasChange(index: number, key: string, value: unknown) {
    setAspekCerdas(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  function handleMandiriChange(index: number, key: string, value: unknown) {
    setAspekMandiri(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/anakjuara/penilaian/${initialData.id_anak}/${semester}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          aspek_cerdas:  aspekCerdas,
          aspek_mandiri: aspekMandiri,
          catatan,
          suara_anak:   suaraAnak,
        }),
      });

      if (!res.ok) throw new Error();

      alert('Penilaian berhasil diperbarui!');
      startTransition(() => {
        router.push('/penilaian');
        router.refresh();
      });
    } catch {
      alert('Gagal memperbarui penilaian.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Info */}
      <Card>
        <CardHead title="Informasi Laporan" />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700 }}>Nama Anak</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{initialData.nama_anak}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700 }}>ID Anak</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#BF4E02', marginTop: 2 }}>{initialData.id_anak}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700 }}>Wilayah</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{initialData.nama_wilayah}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7A6055', fontWeight: 700 }}>Semester</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>Semester {semester}</div>
          </div>
        </div>
      </Card>

      {/* Aspek Cerdas */}
      <Card>
        <CardHead title="Edit Aspek Cerdas (Pendidikan & Hafalan)" />
        <div style={{ overflowX: 'auto', padding: 10 }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Aspek</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: 140 }}>Target</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: 140 }}>Kondisi Awal</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: 140 }}>Perkembangan</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: 140 }}>Hasil Akhir</th>
              </tr>
            </thead>
            <tbody>
              {aspekCerdas.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F2EAE3' }}>
                  <td style={{ padding: 8, fontWeight: 700 }}>{r.aspek}</td>
                  <td style={{ padding: 8 }}>
                    <Input
                      value={r.target}
                      onChange={e => handleCerdasChange(i, 'target', e.target.value)}
                      style={{ fontSize: 12, padding: '4px 6px' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Input
                      value={r.kondisi_awal}
                      onChange={e => handleCerdasChange(i, 'kondisi_awal', e.target.value)}
                      style={{ fontSize: 12, padding: '4px 6px' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Input
                      value={r.perkembangan_capaian}
                      onChange={e => handleCerdasChange(i, 'perkembangan_capaian', e.target.value)}
                      style={{ fontSize: 12, padding: '4px 6px' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Sel
                      value={r.hasil_akhir}
                      onChange={e => handleCerdasChange(i, 'hasil_akhir', e.target.value)}
                      style={{ fontSize: 12, padding: '4px 6px' }}
                    >
                      {NILAI_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Sel>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Aspek Mandiri */}
      <Card>
        <CardHead title="Edit Aspek Mandiri (Karakter & Pembiasaan)" />
        <div style={{ overflowX: 'auto', padding: 10 }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Aspek</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: 140 }}>Target</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: 120 }}>Capaian (%)</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: 140 }}>Hasil Akhir</th>
              </tr>
            </thead>
            <tbody>
              {aspekMandiri.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F2EAE3' }}>
                  <td style={{ padding: 8, fontWeight: 700 }}>{r.aspek}</td>
                  <td style={{ padding: 8 }}>
                    <Input
                      value={r.target}
                      onChange={e => handleMandiriChange(i, 'target', e.target.value)}
                      style={{ fontSize: 12, padding: '4px 6px' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Input
                      type="number"
                      value={r.nilai_capaian}
                      onChange={e => handleMandiriChange(i, 'nilai_capaian', Number(e.target.value))}
                      style={{ fontSize: 12, padding: '4px 6px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Sel
                      value={r.hasil_akhir}
                      onChange={e => handleMandiriChange(i, 'hasil_akhir', e.target.value)}
                      style={{ fontSize: 12, padding: '4px 6px' }}
                    >
                      {NILAI_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Sel>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Catatan & Rekomendasi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <Card>
          <CardHead title="Catatan & Rekomendasi Pembina" />
          <div style={{ padding: 14 }}>
            <Textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Tulis catatan perkembangan atau rekomendasi untuk anak..."
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Suara Anak Juara (Impian / Cita-Cita)" />
          <div style={{ padding: 14 }}>
            <Textarea
              value={suaraAnak}
              onChange={e => setSuaraAnak(e.target.value)}
              placeholder="Tulis impian, cita-cita, atau masukan dari anak..."
            />
          </div>
        </Card>
      </div>

      {/* Form Buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
        <Btn onClick={() => router.back()} variant="outline">
          Batal
        </Btn>
        <Btn type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Penilaian'}
        </Btn>
      </div>
    </form>
  );
}
