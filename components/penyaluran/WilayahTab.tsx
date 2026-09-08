'use client';
import { useCallback, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';
import { Sel } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { SimplePager } from '@/components/ui/SimplePager';
import { ErrorRetry } from '@/components/ui/ErrorRetry';
import type { PageSizeOption } from '@/components/ui/DesktopPagination';
import { NewBulkWizard } from '@/components/penyaluran/NewBulkWizard';
import { BatchDetailModal } from '@/components/penyaluran/BatchDetailModal';
import { useBatchList, usePenyaluranLookup } from '@/hooks/usePenyaluran';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { fmtRp } from '@/lib/utils';
import type { PenyaluranBatch } from '@/types/penyaluran';

const T = { green: '#1A7A45', greenPale: '#E5F5ED', gray: '#7A6055', gold: '#B87800', goldPale: '#FDF4DC' };

export function WilayahTab() {
  const { kantor, wilayah } = usePenyaluranLookup();
  const [kantorId, setKantorId] = useState('');
  const [wilayahId, setWilayahId] = useState('');
  const [bulan, setBulan] = useState('');
  // Defaults to the current year so the first paint stays scoped — an unfiltered grid
  // aggregates the whole ajis_penyaluran table (see lib/penyaluran/queries.ts).
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [page, setPage] = useState(1);
  const limit: PageSizeOption = DEFAULT_PAGE_SIZE;
  const [showNewBulk, setShowNewBulk] = useState(false);
  const [selected, setSelected] = useState<PenyaluranBatch | null>(null);

  const list = useBatchList({
    kantor_id: kantorId, id_wilayah_pembinaan: wilayahId, bulan, tahun, page, limit,
  });

  const refresh = useCallback(() => list.mutate(), [list]);
  const filteredWilayah = kantorId ? wilayah.filter(w => w.kantor_id === kantorId) : wilayah;
  const kantorOptions = useMemo(() => kantor.map(k => ({ value: k.oid, label: k.kantor })), [kantor]);
  const wilayahOptions = useMemo(
    () => filteredWilayah.map(w => ({ value: String(w.id_wilayah_pembinaan), label: w.nama_wilayah })),
    [filteredWilayah],
  );

  const exportUrl = (() => {
    const qs = new URLSearchParams();
    if (kantorId) qs.set('kantor_id', kantorId);
    if (wilayahId) qs.set('id_wilayah_pembinaan', wilayahId);
    if (bulan) qs.set('bulan', bulan);
    if (tahun) qs.set('tahun', tahun);
    return `/api/anakjuara/penyaluran/export${qs.toString() ? `?${qs}` : ''}`;
  })();

  const columns = [
    {
      key: 'id_penyaluran', label: 'ID Penyaluran', width: 170, sticky: true,
      render: (r: PenyaluranBatch) => <strong>{r.id_penyaluran}</strong>,
    },
    { key: 'nama_wilayah', label: 'Wilayah', width: 190, sticky: true, sep: true, render: (r: PenyaluranBatch) => r.nama_wilayah },
    { key: 'nama_kantor', label: 'Kantor', width: 170, render: (r: PenyaluranBatch) => r.nama_kantor },
    { key: 'bulan', label: 'Bulan', width: 80, align: 'right' as const, render: (r: PenyaluranBatch) => r.bulan },
    { key: 'tahun', label: 'Tahun', width: 80, align: 'right' as const, render: (r: PenyaluranBatch) => r.tahun },
    { key: 'periode', label: 'Periode', width: 90, render: (r: PenyaluranBatch) => r.periode },
    { key: 'jumlah_anak', label: 'Jml Anak', width: 90, align: 'right' as const, render: (r: PenyaluranBatch) => r.jumlah_anak },
    {
      key: 'jumlah_penyaluran', label: 'Jumlah Penyaluran', width: 150, align: 'right' as const,
      render: (r: PenyaluranBatch) => <strong style={{ color: T.green }}>{fmtRp(r.jumlah_penyaluran)}</strong>,
    },
    { key: 'jumlah_hpp', label: 'Jumlah HPP', width: 130, align: 'right' as const, render: (r: PenyaluranBatch) => fmtRp(r.jumlah_hpp) },
    { key: 'nama_sdm', label: 'SDM', width: 150, render: (r: PenyaluranBatch) => r.nama_sdm || '-' },
    { key: 'tgl_penyaluran', label: 'Tgl Penyaluran', width: 130, render: (r: PenyaluranBatch) => r.tgl_penyaluran?.slice(0, 10) || '-' },
    {
      key: 'status_akhir', label: 'Status', width: 100,
      render: (r: PenyaluranBatch) => r.status_akhir === 'y'
        ? <Badge label="Terkunci" color={T.gold} bg={T.goldPale} />
        : <Badge label="Berjalan" color={T.green} bg={T.greenPale} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 160 }}>
          <FLabel>Kantor</FLabel>
          <SearchSelect
            value={kantorId}
            onChange={v => { setKantorId(v); setWilayahId(''); setPage(1); }}
            options={kantorOptions}
            allowEmpty
            emptyLabel="Semua kantor"
            clearable
            placeholder="Ketik atau pilih kantor…"
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <FLabel>Wilayah</FLabel>
          <SearchSelect
            value={wilayahId}
            onChange={v => { setWilayahId(v); setPage(1); }}
            options={wilayahOptions}
            allowEmpty
            emptyLabel="Semua wilayah"
            clearable
            placeholder="Ketik nama wilayah…"
          />
        </div>
        <div style={{ minWidth: 100 }}>
          <FLabel>Bulan</FLabel>
          <Sel value={bulan} onChange={e => { setBulan(e.target.value); setPage(1); }}>
            <option value="">Semua</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(b => <option key={b} value={String(b)}>{b}</option>)}
          </Sel>
        </div>
        <div style={{ minWidth: 100 }}>
          {/* No "Semua" option: an unfiltered year scans the entire table server-side
              (lib/penyaluran/queries.ts::defaultTahun), so the picker always names one. */}
          <FLabel>Tahun</FLabel>
          <Sel value={tahun} onChange={e => { setTahun(e.target.value); setPage(1); }}>
            {[0, 1, 2].map(d => {
              const y = new Date().getFullYear() - d;
              return <option key={y} value={String(y)}>{y}</option>;
            })}
          </Sel>
        </div>
        <Btn variant="primary" onClick={() => setShowNewBulk(true)}>
          <Plus size={15} /> New Pengajuan
        </Btn>
        <a href={exportUrl}><Btn variant="outline"><Download size={15} /> Export</Btn></a>
      </div>

      {list.error ? (
        <ErrorRetry
          message={list.error.message || 'Gagal memuat data batch penyaluran.'}
          onRetry={refresh}
        />
      ) : (
        <div className="datagrid-desktop">
          <DataTable<PenyaluranBatch>
            columns={columns}
            data={list.isReady ? list.data : []}
            loading={!list.isReady}
            rowKey={r => r.id_penyaluran}
            onRowClick={r => setSelected(r)}
            gridLines
            minWidth={1600}
            emptyText="Tidak ada batch penyaluran untuk filter ini."
          />
        </div>
      )}

      {list.data.length > 0 && (
        <SimplePager
          page={page} hasMore={list.hasMore} onPageChange={setPage}
          shownCount={list.data.length}
        />
      )}

      {showNewBulk && (
        <NewBulkWizard onClose={() => setShowNewBulk(false)} onSuccess={() => { setShowNewBulk(false); refresh(); }} />
      )}

      {selected && (
        <BatchDetailModal
          batch={selected}
          onClose={() => setSelected(null)}
          onBatchChanged={refresh}
        />
      )}
    </div>
  );
}
