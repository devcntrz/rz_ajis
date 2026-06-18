'use client';
import { useParams, useRouter } from 'next/navigation';
import { usePembinaanDetail } from '@/hooks/usePembinaan';
import { PembinaanForm } from '@/components/pembinaan/PembinaanForm';
import { ArrowLeft } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';

export default function EditPembinaanPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { session, loading, error } = usePembinaanDetail(id);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 350, borderRadius: 16 }} />
      </div>
    );
  }

  if (error || !session) {
    return <div style={{ color: '#B02020', padding: 20 }}>Sesi pembinaan tidak ditemukan.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn onClick={() => router.back()} variant="ghost" style={{ padding: 6 }}>
          <ArrowLeft size={18} />
        </Btn>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A0A00' }}>Edit Sesi Pembinaan</h2>
          <span style={{ fontSize: 12, color: '#7A6055' }}>Update materi dan absensi kehadiran</span>
        </div>
      </div>

      <PembinaanForm initialData={session} isEdit />
    </div>
  );
}
