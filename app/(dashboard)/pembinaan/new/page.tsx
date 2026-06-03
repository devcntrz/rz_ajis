'use client';
import useSWR from 'swr';
import { PembinaanForm } from '@/components/pembinaan/PembinaanForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Btn } from '@/components/ui/Btn';
import type { AnakListRow } from '@/types/anak';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NewPembinaanPage() {
  const router = useRouter();

  // Fetch children list to record attendance
  const { data: res, error, isLoading } = useSWR<{ data: AnakListRow[] }>(
    '/api/anakjuara/anak?limit=100',
    fetcher,
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 350, borderRadius: 16 }} />
      </div>
    );
  }

  if (error) {
    return <div style={{ color: '#B02020' }}>Gagal memuat daftar anak asuh untuk absensi.</div>;
  }

  const anakList = res?.data ?? [];

  // Map AnakListRow to initial PembinaanAnakRow shape
  const mappedList = anakList.map(a => ({
    id_row:             0,
    id_pembinaan:       '',
    id_anak:            a.id_anak,
    nama_lengkap:       a.nama_lengkap,
    jenjang_pendidikan: a.jenjang_pendidikan,
    status_ortu:        a.status_ortu,
    jns_kel:            a.jns_kel,
    kehadiran:          'y' as const,
    keterangan:         '',
    pembiasaan_shalat_wajib: 1,
    pembiasaan_tilawah: 1,
    pembiasaan_sedekah: 1,
    membantu_ortu:      1,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn onClick={() => router.back()} variant="ghost" style={{ padding: 6 }}>
          <ArrowLeft size={18} />
        </Btn>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A0A00' }}>Catat Pembinaan Baru</h2>
          <span style={{ fontSize: 12, color: '#7A6055' }}>Lengkapi data materi dan absensi anak asuh</span>
        </div>
      </div>

      <PembinaanForm anakList={mappedList} />
    </div>
  );
}
