'use client';
import { useCallback, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { useAjuanList } from '@/hooks/useAjuanList';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useMobileInfiniteList } from '@/hooks/useMobileInfiniteList';
import { AjuanFilter } from '@/components/ajuan/AjuanFilter';
import { AjuanTable } from '@/components/ajuan/AjuanTable';
import { AjuanCard } from '@/components/ajuan/AjuanCard';
import { EksekusiForm } from '@/components/ajuan/EksekusiForm';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { InfiniteScrollTrigger } from '@/components/ui/InfiniteScrollTrigger';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import { filtersToQuery } from '@/lib/excel';
import type { AjuanGantiAnak } from '@/types/ajuan';

interface Props {
  idGroupUser: number;
}

export function AjuanPergantianClient({ idGroupUser }: Props) {
  const isMobile = useIsMobile();
  const currentYear = String(new Date().getFullYear());
  const [filters, setFilters] = useState<Record<string, string>>({ tahun: currentYear });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [mobilePage, setMobilePage] = useState(1);
  const [eksekusiRow, setEksekusiRow] = useState<AjuanGantiAnak | null>(null);
  const [toast, setToast] = useState('');
  const [exporting, setExporting] = useState(false);
  const filtersKey = JSON.stringify(filters);
  const totalRef = useRef(0);

  const handleExport = async () => {
    setExporting(true);
    try {
      const qs = filtersToQuery(filters);
      const res = await fetch(`/api/anakjuara/ajuan-ganti-anak/export${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || 'Gagal export Excel.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ajuan-pergantian.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal export Excel.');
    } finally {
      setExporting(false);
    }
  };

  const desktopList = useAjuanList(
    { ...filters, page, limit },
    { enabled: !isMobile },
  );
  const mobileList = useAjuanList(
    { ...filters, page: mobilePage, limit: DEFAULT_PAGE_SIZE },
    { enabled: isMobile },
  );

  const infinite = useMobileInfiniteList({
    enabled: isMobile,
    filtersKey,
    getId: r => String(r.id_ajuan),
    query: {
      data:         mobileList.data,
      total:        mobileList.total,
      page:         mobileList.page,
      isReady:      mobileList.isReady,
      isValidating: mobileList.isValidating,
      isLoading:    mobileList.loading,
    },
    currentPage: mobilePage,
    setPage:     setMobilePage,
  });

  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(prev => {
      if (filtersAreEqual(prev, newFilters)) return prev;
      setPage(1);
      setMobilePage(1);
      return newFilters;
    });
  }, []);

  const refresh = () => {
    desktopList.mutate();
    mobileList.mutate();
  };

  /**
   * The saldo confirmation belongs to the click, not to the modal's lifecycle.
   * Living in an effect made StrictMode's mount/unmount/mount replay ask twice.
   */
  const handleEksekusi = (row: AjuanGantiAnak) => {
    if (!window.confirm('Sudah Update Saldo Akhir ?')) return;
    setEksekusiRow(row);
  };

  const handleDelete = async (row: AjuanGantiAnak) => {
    if (!window.confirm(`Hapus ajuan #${row.id_ajuan} (${row.nama_anak_asal} → ${row.nama_anak_pengganti})?`)) {
      return;
    }
    const res = await fetch(`/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || 'Gagal menghapus.');
      return;
    }
    setToast('Ajuan berhasil dihapus.');
    refresh();
  };

  const handleUlangi = async (row: AjuanGantiAnak) => {
    if (!window.confirm(`Ulangi approval ajuan #${row.id_ajuan}? Status akan kembali ke Pending.`)) {
      return;
    }
    const res = await fetch(`/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/ulangi`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || 'Gagal mengulangi.');
      return;
    }
    setToast('Ajuan di-reset ke Pending.');
    refresh();
  };

  if (desktopList.isReady && desktopList.total > 0) {
    totalRef.current = desktopList.total;
  } else if (isMobile && infinite.total > 0) {
    totalRef.current = infinite.total;
  }

  const displayTotal = isMobile
    ? (infinite.total || totalRef.current)
    : (desktopList.isReady ? desktopList.total : totalRef.current);

  const desktopRows = desktopList.isReady ? desktopList.data : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>List Ajuan Pergantian</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Total ajuan: {displayTotal}
            {isMobile && infinite.items.length > 0 && (
              <> · Ditampilkan {infinite.items.length}</>
            )}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', fontSize: 11 }}>
            <span style={{ color: '#1A7A45', fontWeight: 700, padding: '3px 8px', borderRadius: 8, border: '1px solid #1A7A4540' }}>Hijau = Disetujui</span>
            <span style={{ color: '#1A5FA8', fontWeight: 700, padding: '3px 8px', borderRadius: 8, border: '1px solid #1A5FA840' }}>Biru = Dieksekusi</span>
            <span style={{ color: '#B02020', fontWeight: 700, padding: '3px 8px', borderRadius: 8, border: '1px solid #B0202040' }}>Merah = Ditolak</span>
          </div>
        </div>
        <Btn variant="outline" onClick={handleExport} disabled={exporting}>
          <Download size={16} />
          {exporting ? 'Export...' : 'Export Excel'}
        </Btn>
      </div>

      {toast && (
        <div style={{
          background: '#E5F5ED', color: '#1A7A45', borderRadius: 10,
          padding: '10px 14px', fontSize: 13, fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      <AjuanFilter onFilterChange={handleFilterChange} idGroupUser={idGroupUser} />

      <div className="datagrid-desktop">
        <AjuanTable
          data={desktopRows}
          loading={!desktopList.isReady}
          rowOffset={(page - 1) * limit}
          onDelete={handleDelete}
          onUlangi={handleUlangi}
          onEksekusi={handleEksekusi}
        />
      </div>

      <AjuanCard
        data={isMobile ? infinite.items : desktopRows}
        loading={infinite.isInitialLoading}
        onDelete={handleDelete}
        onUlangi={handleUlangi}
        onEksekusi={handleEksekusi}
      />

      {!isMobile && displayTotal > 0 && (
        <DesktopPagination
          page={page}
          limit={limit}
          total={displayTotal}
          onPageChange={setPage}
          onLimitChange={next => { setLimit(next); setPage(1); }}
        />
      )}

      {isMobile && (
        <InfiniteScrollTrigger
          onLoadMore={infinite.loadMore}
          hasMore={infinite.hasMore}
          loading={infinite.isInitialLoading || infinite.isLoadingMore}
        />
      )}

      {eksekusiRow && (
        <EksekusiForm
          row={eksekusiRow}
          onClose={() => setEksekusiRow(null)}
          onSuccess={() => {
            setEksekusiRow(null);
            setToast('Eksekusi berhasil.');
            refresh();
          }}
        />
      )}
    </div>
  );
}
