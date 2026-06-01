'use client';
import { useCallback, useState } from 'react';
import { filtersAreEqual } from '@/lib/pagination';
import { usePenilaianList } from '@/hooks/usePenilaian';
import { PenilaianFilter } from '@/components/penilaian/PenilaianFilter';
import { PenilaianTable } from '@/components/penilaian/PenilaianTable';
import { PenilaianCard } from '@/components/penilaian/PenilaianCard';
import { PivotTable } from '@/components/penilaian/PivotTable';
import { TabBar } from '@/components/ui/TabBar';
import { Btn } from '@/components/ui/Btn';
import { RefreshCw, List, Grid } from 'lucide-react';

const tabs = [
  { id: 'list',  label: 'Daftar Evaluasi', icon: List },
  { id: 'pivot', label: 'Pivot Penilaian',  icon: Grid },
];

export default function PenilaianListPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [semester, setSemester] = useState('25');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [syncingAll, setSyncingAll] = useState(false);

  const { data, loading, mutate } = usePenilaianList({ ...filters, semester });

  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(prev => (filtersAreEqual(prev, newFilters) ? prev : newFilters));
  }, []);

  async function handleSync(idAnak: string) {
    try {
      const res = await fetch('/api/anakjuara/penilaian/sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id_anak: idAnak, semesterid: semester }),
      });
      if (!res.ok) throw new Error();
      mutate();
    } catch {
      alert('Gagal menyinkronkan data.');
    }
  }

  async function handleSyncMassal() {
    if (!confirm(`Apakah Anda yakin ingin menyinkronkan massal semua anak asuh yang BELUM memiliki raport untuk Semester ${semester}?`)) return;

    setSyncingAll(true);
    try {
      const res = await fetch('/api/anakjuara/penilaian/sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id_anak: 'all', semesterid: semester }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Gagal sinkronisasi.');

      alert(body.message || 'Sinkronisasi massal berhasil.');
      mutate();
    } catch (err: any) {
      alert(err.message || 'Gagal menyinkronkan massal.');
    } finally {
      setSyncingAll(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Evaluasi & Raport Semester</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola raport hasil belajar, capaian cerdas, dan pembiasaan mandiri
          </p>
        </div>
        <Btn
          onClick={handleSyncMassal}
          disabled={syncingAll}
          variant="primary"
          style={{ padding: '8px 16px' }}
        >
          <RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />
          <span>{syncingAll ? 'Proses Sync...' : 'Sync Massal'}</span>
        </Btn>
      </div>

      {/* Advanced Filters */}
      <PenilaianFilter
        onFilterChange={handleFilterChange}
        semester={semester}
        setSemester={setSemester}
      />

      {/* Tab Switcher */}
      <div style={{ borderBottom: '2px solid #F2EAE3', marginBottom: 6 }}>
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Contents */}
      {activeTab === 'list' ? (
        <>
          <div className="datagrid-desktop">
            <PenilaianTable
              data={data}
              loading={loading}
              semester={semester}
              onSync={handleSync}
            />
          </div>
          <PenilaianCard
            data={data}
            semester={semester}
            onSync={handleSync}
          />
        </>
      ) : (
        <PivotTable
          semester={semester}
          wilayah={filters.wilayah || ''}
          q={filters.q || ''}
        />
      )}
    </div>
  );
}
