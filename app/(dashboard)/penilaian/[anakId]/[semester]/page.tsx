'use client';
import { useParams, useRouter } from 'next/navigation';
import { usePenilaianDetail } from '@/hooks/usePenilaian';
import { LaporanCard } from '@/components/penilaian/LaporanCard';
import { Btn } from '@/components/ui/Btn';
import { ArrowLeft, Edit, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function PenilaianDetailPage() {
  const router = useRouter();
  const { anakId, semester } = useParams() as { anakId: string; semester: string };
  const { detail, loading, error, mutate } = usePenilaianDetail(anakId, semester);
  const [syncing, setSyncing] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 350, borderRadius: 16 }} />
      </div>
    );
  }

  if (error || !detail) {
    return <div style={{ color: '#B02020', padding: 20 }}>Raport tidak ditemukan.</div>;
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch('/api/anakjuara/penilaian/sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id_anak: anakId, semesterid: semester }),
      });
      if (!res.ok) throw new Error();

      alert('Berhasil sinkronisasi nilai terbaru!');
      mutate();
    } catch {
      alert('Gagal menyinkronkan data.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Btn onClick={() => router.back()} variant="ghost" style={{ padding: 6 }}>
            <ArrowLeft size={18} />
          </Btn>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A0A00' }}>Hasil Raport Evaluasi</h2>
            <span style={{ fontSize: 12, color: '#7A6055' }}>Capaian Anak Juara</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <Btn onClick={handleSync} disabled={syncing} variant="outline">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>Recalculate (Sync)</span>
          </Btn>
          <Btn onClick={() => router.push(`/penilaian/${anakId}/${semester}/edit`)} variant="primary">
            <Edit size={14} />
            <span>Edit Nilai</span>
          </Btn>
        </div>
      </div>

      {/* Laporan Card */}
      <LaporanCard data={detail} />
    </div>
  );
}
