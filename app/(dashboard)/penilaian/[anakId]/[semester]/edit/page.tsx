'use client';
import { useParams, useRouter } from 'next/navigation';
import { usePenilaianDetail } from '@/hooks/usePenilaian';
import { PenilaianEditForm } from '@/components/penilaian/PenilaianEditForm';
import { ArrowLeft } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';

export default function EditPenilaianPage() {
  const router = useRouter();
  const { anakId, semester } = useParams() as { anakId: string; semester: string };
  const { detail, loading, error } = usePenilaianDetail(anakId, semester);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn onClick={() => router.back()} variant="ghost" style={{ padding: 6 }}>
          <ArrowLeft size={18} />
        </Btn>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A0A00' }}>Edit Nilai Raport</h2>
          <span style={{ fontSize: 12, color: '#7A6055' }}>Sesuaikan target, baseline, and capaian</span>
        </div>
      </div>

      <PenilaianEditForm initialData={detail} semester={semester} />
    </div>
  );
}
