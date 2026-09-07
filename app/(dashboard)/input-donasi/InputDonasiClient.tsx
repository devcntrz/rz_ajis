'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Info } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { InputDonasiFilter, type Filters } from '@/components/input-donasi/InputDonasiFilter';
import { InputDonasiTable } from '@/components/input-donasi/InputDonasiTable';
import { NewSingleDonasiForm } from '@/components/input-donasi/NewSingleDonasiForm';
import { useInputDonasiList } from '@/hooks/useInputDonasi';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import { fmtRp } from '@/lib/utils';
import type { InputDonasi } from '@/types/input-donasi';

const T = { primary: '#BF4E02', charcoal: '#1A0A00', gray: '#7A6055', bluePale: '#E5EEF8', blue: '#1A5FA8' };

interface Props { idGroupUser: number; }

export function InputDonasiClient({ idGroupUser }: Props) {
  const isAdmin = idGroupUser === 1;
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [showNewSingle, setShowNewSingle] = useState(false);

  const list = useInputDonasiList({ ...filters, page, limit });

  const refresh = useCallback(() => { list.mutate(); }, [list]);

  const applyFilters = useCallback((next: Filters) => {
    setFilters(prev => {
      if (filtersAreEqual(prev, next)) return prev;
      setPage(1);
      return next;
    });
  }, []);

  const handleDelete = async (row: InputDonasi) => {
    if (!window.confirm(`Hapus baris donasi ${row.nama_anak} (${fmtRp(row.nominal_donasi)})?`)) return;
    const res = await fetch(`/api/anakjuara/input-donasi/${row.id_input_donasi}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error || 'Gagal menghapus.'); return; }
    toast.success(json.message || 'Baris donasi dihapus.');
    refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: T.charcoal }}>Input Donasi</h2>
          <p style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
            Riwayat donasi masuk per anak · Total {list.total} baris
          </p>
        </div>
        <Btn variant="primary" onClick={() => setShowNewSingle(true)}>
          <Plus size={15} /> New Single
        </Btn>
      </div>

      <InputDonasiFilter value={filters} onApply={applyFilters} />

      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        background: T.bluePale, color: T.blue, borderRadius: 10,
        padding: '9px 13px', fontSize: 12.5, fontWeight: 600,
      }}>
        <Info size={15} />
        <span>Total nominal donasi (sesuai filter): <strong>{fmtRp(list.footerTotal)}</strong></span>
      </div>

      <div className="datagrid-desktop">
        <InputDonasiTable
          data={list.isReady ? list.data : []}
          loading={!list.isReady}
          rowOffset={(page - 1) * limit}
          isAdmin={isAdmin}
          onDelete={handleDelete}
        />
      </div>

      {list.total > 0 && (
        <DesktopPagination
          page={page}
          limit={limit}
          total={list.total}
          onPageChange={setPage}
          onLimitChange={next => { setLimit(next); setPage(1); }}
        />
      )}

      {showNewSingle && (
        <NewSingleDonasiForm
          onClose={() => setShowNewSingle(false)}
          onSuccess={() => { setShowNewSingle(false); refresh(); }}
        />
      )}
    </div>
  );
}
