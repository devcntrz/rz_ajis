'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Download, Plus } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import { usePeminjamanList } from '@/hooks/usePeminjaman';
import { DEFAULT_PAGE_SIZE, filtersAreEqual } from '@/lib/pagination';
import { filtersToQuery } from '@/lib/excel';
import { PeminjamanFilter } from './PeminjamanFilter';
import { PeminjamanTable } from './PeminjamanTable';
import { PeminjamanForm } from './PeminjamanForm';
import { PasangDonaturForm, type PasangAnakTarget } from '@/components/calon-anak-juara/PasangDonaturForm';
import type { PeminjamanAnakRow } from '@/types/peminjaman';

interface Props {
  idGroupUser: number;
}

export function PeminjamanClient({ idGroupUser }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [showForm, setShowForm] = useState(false);
  const [pasangTarget, setPasangTarget] = useState<PasangAnakTarget | null>(null);
  const [exporting, setExporting] = useState(false);

  const list = usePeminjamanList({ ...filters, page, limit });

  const handleFilterChange = useCallback((next: Record<string, string>) => {
    setFilters(prev => {
      if (filtersAreEqual(prev, next)) return prev;
      setPage(1);
      return next;
    });
  }, []);

  const cancel = async (row: PeminjamanAnakRow) => {
    const alasan = window.prompt(`Alasan pembatalan peminjaman "${row.nama_anak}"?`);
    if (!alasan) return;
    const res = await fetch(`/api/anakjuara/peminjaman/${row.id_peminjaman}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alasan_cancel: alasan }),
    });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error || 'Gagal membatalkan peminjaman.'); return; }
    toast.success('Peminjaman dibatalkan.');
    list.mutate();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const qs = filtersToQuery(filters);
      const res = await fetch(`/api/anakjuara/peminjaman/export${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || 'Gagal export Excel.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'peminjaman-anak.xlsx';
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

  const displayTotal = list.total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Peminjaman Anak</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>Total: {displayTotal}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="outline" onClick={handleExport} disabled={exporting}>
            <Download size={15} /> {exporting ? 'Export...' : 'Export Excel'}
          </Btn>
          <Btn variant="primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Peminjaman Baru
          </Btn>
        </div>
      </div>

      <PeminjamanFilter onFilterChange={handleFilterChange} idGroupUser={idGroupUser} />

      <PeminjamanTable
        data={list.isReady ? list.data : []}
        loading={!list.isReady}
        rowOffset={(page - 1) * limit}
        onCancel={cancel}
        onPasangDonatur={r => setPasangTarget({ id_anak: r.id_anak ?? '', nama_anak: r.nama_anak ?? '', nama_kantor: r.nama_kantor })}
      />

      {displayTotal > 0 && (
        <DesktopPagination
          page={page}
          limit={limit}
          total={displayTotal}
          onPageChange={setPage}
          onLimitChange={next => { setLimit(next); setPage(1); }}
        />
      )}

      {showForm && (
        <PeminjamanForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); list.mutate(); }}
        />
      )}

      {pasangTarget && (
        <PasangDonaturForm
          anak={pasangTarget}
          onClose={() => setPasangTarget(null)}
          onSuccess={() => { setPasangTarget(null); list.mutate(); }}
        />
      )}
    </div>
  );
}
