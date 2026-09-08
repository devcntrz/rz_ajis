'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useLapsem } from '@/hooks/useLapsem';
import { useRekapLapsem } from '@/hooks/useRekapLapsem';
import { LapsemFilter } from '@/components/laporan-semester/LapsemFilter';
import { LapsemTable } from '@/components/laporan-semester/LapsemTable';
import { LapsemCard } from '@/components/laporan-semester/LapsemCard';
import { RekapTable } from '@/components/laporan-semester/RekapTable';
import { TabBar } from '@/components/ui/TabBar';
import { Btn } from '@/components/ui/Btn';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import type { LapsemRow } from '@/types/laporan-semester';

interface Props {
  idGroupUser: number;
  canApprove:  boolean;
}

function openPreview(laporanid: string) {
  window.open(`/api/anakjuara/laporan-semester/${encodeURIComponent(laporanid)}/preview`, '_blank');
}

export function LaporanSemesterClient({ idGroupUser, canApprove }: Props) {
  const [tab, setTab] = useState<'lapsem' | 'rekap'>('lapsem');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rekapSemester, setRekapSemester] = useState('');
  const [exporting, setExporting] = useState(false);

  const lapsem = useLapsem({ ...filters, page, limit });
  const rekap = useRekapLapsem(rekapSemester);

  const handleFilterChange = (next: Record<string, string>) => {
    setFilters(next);
    setPage(1);
  };

  const handleApprove = async (row: LapsemRow) => {
    setApprovingId(row.laporanid);
    try {
      const res = await fetch(`/api/anakjuara/laporan-semester/${encodeURIComponent(row.laporanid)}/approve`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal approve laporan semester.');
        return;
      }
      toast.success(`Laporan ${row.laporanid} berhasil di-approve.`);
      lapsem.mutate();
    } catch {
      toast.error('Gagal approve laporan semester.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleExportRekap = async () => {
    if (!rekapSemester) {
      toast.error('Pilih semester terlebih dahulu.');
      return;
    }
    setExporting(true);
    try {
      const res = await fetch(`/api/anakjuara/laporan-semester/export?semesterid=${encodeURIComponent(rekapSemester)}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || 'Gagal export Excel.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap-laporan-semester-${rekapSemester}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Gagal export Excel.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Laporan Semester</h2>
        <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
          Grid laporan per-anak per-semester dan rekap per-kantor.
        </p>
      </div>

      <TabBar
        tabs={[
          { id: 'lapsem', label: 'Lapsem' },
          { id: 'rekap', label: 'Rekap' },
        ]}
        active={tab}
        onChange={id => setTab(id as 'lapsem' | 'rekap')}
      />

      {tab === 'lapsem' && (
        <>
          <LapsemFilter onFilterChange={handleFilterChange} idGroupUser={idGroupUser} />

          <div className="datagrid-desktop">
            <LapsemTable
              data={lapsem.isReady ? lapsem.data : []}
              loading={!lapsem.isReady}
              rowOffset={(page - 1) * limit}
              onPreview={r => openPreview(r.laporanid)}
              onApprove={handleApprove}
              approvingId={approvingId}
              canApprove={canApprove}
            />
          </div>

          <LapsemCard
            data={lapsem.isReady ? lapsem.data : []}
            loading={!lapsem.isReady}
            onPreview={r => openPreview(r.laporanid)}
            onApprove={handleApprove}
            approvingId={approvingId}
            canApprove={canApprove}
          />

          {lapsem.total > 0 && (
            <DesktopPagination
              page={page}
              limit={limit}
              total={lapsem.total}
              onPageChange={setPage}
              onLimitChange={next => { setLimit(next); setPage(1); }}
            />
          )}
        </>
      )}

      {tab === 'rekap' && (
        <>
          <div style={{
            background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
            padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: 220 }}>
              <FLabel>Semester</FLabel>
              <SearchSelect
                value={rekapSemester}
                onChange={setRekapSemester}
                fetchUrl="/api/anakjuara/semester"
                placeholder="Pilih semester…"
              />
            </div>
            <Btn variant="outline" onClick={handleExportRekap} disabled={exporting || !rekapSemester}>
              <Download size={16} />
              {exporting ? 'Export...' : 'Export Excel'}
            </Btn>
          </div>

          {!rekapSemester ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#7A6055', fontSize: 14 }}>
              Pilih semester untuk menampilkan rekap.
            </div>
          ) : (
            <div className="datagrid-desktop">
              <RekapTable data={rekap.data} loading={rekap.loading} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
