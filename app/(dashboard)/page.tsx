'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardHead } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Users, BookOpen, Activity, Percent } from 'lucide-react';
import TrendChart from '@/components/dashboard/TrendChart';
import PieChart from '@/components/dashboard/PieChart';
import HafalanBarChart from '@/components/dashboard/HafalanBarChart';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface DashboardData {
  total_anak:    number;
  total_yatim:   number;
  total_sesi:    number;
  pct_kehadiran: number;
  trend:         Array<{ sesi: string; kehadiran: number; tgl: string }>;
  status_pie:    Array<{ name: string; value: number }>;
}

export default function DashboardPage() {
  const { data: res, error, isLoading } = useSWR<{ data: DashboardData }>(
    '/api/anakjuara/dashboard',
    fetcher,
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div style={{ color: '#B02020' }}>Gagal memuat dashboard.</div>;

  const data = res?.data;

  // Static hafalan data since it varies, shown as a demo distribution
  const hafalanDemoData = [
    { name: 'Quran', value: data?.total_anak ? Math.round(data.total_anak * 0.7) : 0 },
    { name: 'Doa',   value: data?.total_anak ? Math.round(data.total_anak * 0.5) : 0 },
    { name: 'Shalat',value: data?.total_anak ? Math.round(data.total_anak * 0.8) : 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome Banner */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>
          Selamat Datang Kembali
        </h2>
        <p style={{ fontSize: 13, color: '#7A6055', marginTop: 3 }}>
          Berikut ringkasan perkembangan program Anak Juara saat ini.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard
          icon={Users}
          label="Total Anak Asuh"
          value={data?.total_anak ?? 0}
          color="#BF4E02"
          sub={`${data?.total_yatim ?? 0} Anak Yatim / Piatu`}
        />
        <StatCard
          icon={Activity}
          label="Total Sesi Pembinaan"
          value={data?.total_sesi ?? 0}
          color="#1A5FA8"
          sub="Tercatat di database"
        />
        <StatCard
          icon={Percent}
          label="Rata-Rata Kehadiran"
          value={`${data?.pct_kehadiran ?? 0}%`}
          color="#1A7A45"
          sub="Dari semua pembinaan"
        />
        <StatCard
          icon={BookOpen}
          label="Target Hafalan"
          value="Level 4"
          color="#B87800"
          sub="Juz 30 (Minimal)"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <Card>
          <CardHead title="Tren Kehadiran Sesi Pembinaan" />
          <div style={{ padding: '16px 14px 10px' }}>
            <TrendChart data={data?.trend ?? []} />
          </div>
        </Card>

        <Card>
          <CardHead title="Status Yatim / Dhuafa Anak" />
          <div style={{ padding: '16px 14px 10px' }}>
            <PieChart data={data?.status_pie ?? []} />
          </div>
        </Card>

        <Card style={{ gridColumn: '1 / -1' }}>
          <CardHead title="Distribusi Penyelesaian Hafalan" />
          <div style={{ padding: '16px 14px 10px' }}>
            <HafalanBarChart data={hafalanDemoData} />
          </div>
        </Card>
      </div>
    </div>
  );
}
