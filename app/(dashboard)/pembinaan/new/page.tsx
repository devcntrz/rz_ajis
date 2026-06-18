'use client';
import { PembinaanForm } from '@/components/pembinaan/PembinaanForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Btn } from '@/components/ui/Btn';

export default function NewPembinaanPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn onClick={() => router.back()} variant="ghost" style={{ padding: 6 }}>
          <ArrowLeft size={18} />
        </Btn>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A0A00' }}>Catat Pembinaan Baru</h2>
          <span style={{ fontSize: 12, color: '#7A6055' }}>Lengkapi data materi dan absensi anak asuh</span>
        </div>
      </div>

      <PembinaanForm />
    </div>
  );
}
