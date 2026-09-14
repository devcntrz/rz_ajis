'use client';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import { usePenilaianList } from '@/hooks/usePenilaian';
import { useCurrentSemester } from '@/hooks/useCurrentSemester';
import { PenilaianFilter } from '@/components/penilaian/PenilaianFilter';
import { PenilaianTable } from '@/components/penilaian/PenilaianTable';
import { PenilaianCard } from '@/components/penilaian/PenilaianCard';
import { PivotTable } from '@/components/penilaian/PivotTable';
import { TabBar } from '@/components/ui/TabBar';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { RefreshCw, List, Grid } from 'lucide-react';

const tabs = [
  { id: 'list',  label: 'Daftar Evaluasi', icon: List },
  { id: 'pivot', label: 'Pivot Penilaian',  icon: Grid },
];

export default function PenilaianListPage() {
  const [activeTab, setActiveTab] = useState('list');
  const { current: activeSemester } = useCurrentSemester();
  const [semester, setSemester] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    if (!semester && activeSemester) setSemester(activeSemester.semesterid);
  }, [semester, activeSemester]);

  const { data, total, loading, mutate } = usePenilaianList({
    ...filters, semester, page, limit,
  });

  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(prev => {
      if (filtersAreEqual(prev, newFilters)) return prev;
      setPage(1);
      return newFilters;
    });
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
              rowOffset={(page - 1) * limit}
              onSync={handleSync}
            />
          </div>
          <PenilaianCard
            data={data}
            semester={semester}
            onSync={handleSync}
          />
          {total > 0 && (
            <DesktopPagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
              onLimitChange={next => { setLimit(next); setPage(1); }}
            />
          )}
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
