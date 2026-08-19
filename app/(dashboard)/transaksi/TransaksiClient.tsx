'use client';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCheck, Info } from 'lucide-react';
import { TabBar } from '@/components/ui/TabBar';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { InfiniteScrollTrigger } from '@/components/ui/InfiniteScrollTrigger';
import { TransaksiFilter, type Filters } from '@/components/transaksi/TransaksiFilter';
import { TransaksiTable, rowKeyOf } from '@/components/transaksi/TransaksiTable';
import { TransaksiCard } from '@/components/transaksi/TransaksiCard';
import { EntryCashflowForm } from '@/components/transaksi/EntryCashflowForm';
import { ApproveSalurModal } from '@/components/transaksi/ApproveSalurModal';
import { GantiProgramModal } from '@/components/transaksi/GantiProgramModal';
import { useTransaksiList } from '@/hooks/useTransaksi';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useMobileInfiniteList } from '@/hooks/useMobileInfiniteList';
import { useStickyTotal } from '@/hooks/useStickyTotal';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import { fmtRp } from '@/lib/utils';
import type { Transaksi, TransaksiScope } from '@/types/transaksi';

const T = {
  primary: '#BF4E02', charcoal: '#1A0A00', gray: '#7A6055',
  bluePale: '#E5EEF8', blue: '#1A5FA8',
};

const TABS: { id: TransaksiScope; label: string }[] = [
  { id: 'main',         label: 'Transaksi' },
  { id: 'review',       label: 'Review' },
  { id: 'cicilan',      label: 'Cicilan' },
  { id: 'unidentified', label: 'Unidentified' },
];

type EntryTarget = { row: Transaksi; mode: 'create' | 'update' };

interface Props {
  idGroupUser: number;
}

/**
 * One screen for both legacy pages. `Transaksi` (SpMD cabang) and `TransaksiAdmin`
 * existed only because the old stack had no way to vary a page by role; here the
 * difference is `idGroupUser`, and the server enforces it regardless of what the UI shows.
 */
export function TransaksiClient({ idGroupUser }: Props) {
  const isMobile = useIsMobile();
  const isAdmin = idGroupUser === 1;
  const isBranch = idGroupUser === 2;

  const [scope, setScope] = useState<TransaksiScope>('main');
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [mobilePage, setMobilePage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [entryTarget, setEntryTarget] = useState<EntryTarget | null>(null);
  const [salurRow, setSalurRow] = useState<Transaksi | null>(null);
  const [bulkSalur, setBulkSalur] = useState(false);
  const [programRow, setProgramRow] = useState<Transaksi | null>(null);

  const queryParams = useMemo(
    () => ({ ...filters, scope, ...(sortBy ? { sort_by: sortBy, sort_dir: sortDir } : {}) }),
    [filters, scope, sortBy, sortDir],
  );
  const filtersKey = JSON.stringify(queryParams);

  const desktop = useTransaksiList(
    { ...queryParams, page, limit },
    { enabled: !isMobile },
  );
  const mobile = useTransaksiList(
    { ...queryParams, page: mobilePage, limit: DEFAULT_PAGE_SIZE },
    { enabled: isMobile },
  );

  const infinite = useMobileInfiniteList<Transaksi>({
    enabled: isMobile,
    filtersKey,
    getId: rowKeyOf,
    query: {
      data:         mobile.data,
      total:        mobile.total,
      page:         mobile.page,
      isReady:      mobile.isReady,
      isValidating: mobile.isValidating,
      isLoading:    mobile.loading,
    },
    currentPage: mobilePage,
    setPage:     setMobilePage,
  });

  const refresh = useCallback(() => {
    desktop.mutate();
    mobile.mutate();
    setSelected(new Set());
  }, [desktop, mobile]);

  const applyFilters = useCallback((next: Filters) => {
    setFilters(prev => {
      if (filtersAreEqual(prev, next)) return prev;
      setPage(1);
      setMobilePage(1);
      return next;
    });
  }, []);

  const changeScope = (id: string) => {
    setScope(id as TransaksiScope);
    setPage(1);
    setMobilePage(1);
    setSelected(new Set());
  };

  const handleSort = (key: string) => {
    setSortDir(d => (sortBy === key && d === 'asc' ? 'desc' : 'asc'));
    setSortBy(key);
    setPage(1);
  };

  const toggleSelect = (idReview: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idReview)) next.delete(idReview);
      else next.add(idReview);
      return next;
    });
  };

  /* ── row actions ───────────────────────────────────────────────────────────── */

  const handlers = {
    onEntry:  (row: Transaksi) => setEntryTarget({ row, mode: 'create' }),
    onUpdate: (row: Transaksi) => setEntryTarget({ row, mode: 'update' }),
    onApproveSalur: (row: Transaksi) => setSalurRow(row),
    onGantiProgram: (row: Transaksi) => setProgramRow(row),

    onDeleteEntries: async (row: Transaksi) => {
      if (!window.confirm(
        `Hapus seluruh entry cashflow untuk ${row.transid}·${row.detailid}?\n\n` +
        `${fmtRp(row.total_input_donasi)} yang sudah terinput akan dihapus dan ` +
        'transaksi kembali ke status belum dientry.',
      )) return;

      const res = await fetch(
        `/api/anakjuara/transaksi/${encodeURIComponent(row.transid)}/${row.detailid}/entries`,
        { method: 'DELETE' },
      );
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menghapus entry.'); return; }
      toast.success(json.message);
      refresh();
    },

    onDeletePerm: async (row: Transaksi) => {
      if (!window.confirm(
        `HAPUS PERMANEN transaksi ${row.transid}·${row.detailid} ` +
        `(${row.nama_donatur || row.did}, ${fmtRp(row.perkiraan_rp)})?\n\n` +
        'Seluruh input donasi terkait ikut terhapus. Tindakan ini tidak dapat dibatalkan.',
      )) return;

      const res = await fetch(
        `/api/anakjuara/transaksi/${encodeURIComponent(row.transid)}/${row.detailid}`,
        { method: 'DELETE' },
      );
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menghapus transaksi.'); return; }
      toast.success(json.message);
      refresh();
    },
  };

  // Held steady across page changes so the header count does not blink to 0.
  const displayTotal = useStickyTotal(
    isMobile ? infinite.total : desktop.total,
    isMobile ? infinite.total > 0 : desktop.isReady,
  );

  const desktopRows = desktop.isReady ? desktop.data : [];
  const footerTotal = isMobile ? mobile.footerTotal : desktop.footerTotal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.charcoal }}>Transaksi</h2>
        <p style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
          Penyaluran donasi donatur ke Anak Juara · Total {displayTotal} transaksi
          {isMobile && infinite.items.length > 0 && <> · Ditampilkan {infinite.items.length}</>}
        </p>
      </div>

      <TabBar tabs={TABS} active={scope} onChange={changeScope} />

      <TransaksiFilter value={filters} onApply={applyFilters} isBranch={isBranch} />

      {/* Footer sum. Reproduced from legacy including its narrower condition, which is
          why it can be smaller than the rows on screen — labelled rather than silently
          different. */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        background: T.bluePale, color: T.blue, borderRadius: 10,
        padding: '9px 13px', fontSize: 12.5, fontWeight: 600,
      }}>
        <Info size={15} />
        <span>
          Total nominal (approve salur = y, review = y, non-cicilan):{' '}
          <strong>{fmtRp(footerTotal)}</strong>
        </span>
        <span style={{ color: T.gray, fontWeight: 500 }}>
          — mengikuti perhitungan sistem lama, sehingga dapat berbeda dari jumlah baris yang tampil.
        </span>
      </div>

      {scope === 'review' && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn
            variant="primary"
            onClick={() => setBulkSalur(true)}
            disabled={selected.size === 0}
          >
            <CheckCheck size={15} /> Approve Salur ({selected.size})
          </Btn>
          {selected.size > 0 && (
            <Btn variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Batal pilih
            </Btn>
          )}
        </div>
      )}

      <div className="datagrid-desktop">
        <TransaksiTable
          data={desktopRows}
          loading={!desktop.isReady}
          scope={scope}
          isAdmin={isAdmin}
          rowOffset={(page - 1) * limit}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          selected={selected}
          onToggle={toggleSelect}
          {...handlers}
        />
      </div>

      <TransaksiCard
        data={isMobile ? infinite.items : desktopRows}
        loading={infinite.isInitialLoading}
        scope={scope}
        isAdmin={isAdmin}
        selected={selected}
        onToggle={toggleSelect}
        {...handlers}
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

      {entryTarget && (
        <EntryCashflowForm
          row={entryTarget.row}
          mode={entryTarget.mode}
          onClose={() => setEntryTarget(null)}
          onSuccess={() => { setEntryTarget(null); refresh(); }}
        />
      )}

      {salurRow && (
        <ApproveSalurModal
          row={salurRow}
          onClose={() => setSalurRow(null)}
          onSuccess={() => { setSalurRow(null); refresh(); }}
        />
      )}

      {bulkSalur && (
        <ApproveSalurModal
          idReview={[...selected]}
          onClose={() => setBulkSalur(false)}
          onSuccess={() => { setBulkSalur(false); refresh(); }}
        />
      )}

      {programRow && (
        <GantiProgramModal
          row={programRow}
          onClose={() => setProgramRow(null)}
          onSuccess={() => { setProgramRow(null); refresh(); }}
        />
      )}
    </div>
  );
}
