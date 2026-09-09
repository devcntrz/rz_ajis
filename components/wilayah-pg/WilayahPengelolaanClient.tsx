'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { useWilayahPgList } from '@/hooks/useWilayahPgList';
import { WilayahPgTable } from '@/components/wilayah-pg/WilayahPgTable';
import { WilayahPgCard } from '@/components/wilayah-pg/WilayahPgCard';
import { WilayahPgForm } from '@/components/wilayah-pg/WilayahPgForm';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import type { AjisWilayahPg, AjisWilayahPgListItem } from '@/types/wilayah-pg';

interface WilayahPengelolaanClientProps {
  /** Group 1 (Super Admin) or 2 (Branch Admin) may create/edit — mirrors the
   *  POST/PUT gating (lib/auth.ts isGroup12) in the API routes. */
  canManage: boolean;
  /** Only Super Admin (group 1) may delete. */
  canDelete: boolean;
}

export function WilayahPengelolaanClient({ canManage, canDelete }: WilayahPengelolaanClientProps) {
  const [q, setQ] = useState('');
  const [kantorId, setKantorId] = useState('');
  const [aktif, setAktif] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);

  const { data, total, loading, mutate } = useWilayahPgList({ q, kantor_id: kantorId, aktif, page, limit });

  const [formRow, setFormRow] = useState<AjisWilayahPg | null | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const openCreate = () => setFormRow(null);

  const openEdit = async (row: AjisWilayahPgListItem) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/anakjuara/pg/wilayah/${row.idWilayahPembinaan}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat detail wilayah.');
        return;
      }
      setFormRow(json.data as AjisWilayahPg);
    } catch {
      toast.error('Gagal memuat detail wilayah.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (row: AjisWilayahPgListItem) => {
    if (!confirm(`Hapus wilayah "${row.namaWilayah}"?`)) return;
    setBusyId(row.idWilayahPembinaan);
    try {
      const res = await fetch(`/api/anakjuara/pg/wilayah/${row.idWilayahPembinaan}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal menghapus data.');
        return;
      }
      toast.success('Data berhasil dihapus.');
      mutate();
    } catch {
      toast.error('Gagal menghapus data.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Data Wilayah</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola data wilayah pembinaan (coaching region) yang digunakan oleh Manajemen User dan Pengajuan Beasiswa.
          </p>
        </div>
        {canManage && (
          <Btn variant="primary" onClick={openCreate} disabled={formLoading}>
            <Plus size={16} />
            Tambah Wilayah
          </Btn>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#7A6055' }} />
          <Input
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value); }}
            placeholder="Cari nama wilayah atau kantor..."
            style={{ paddingLeft: 30 }}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <SearchSelect
            value={kantorId}
            onChange={v => { setPage(1); setKantorId(v); }}
            fetchUrl="/api/anakjuara/pg/kantor/lookup"
            mapRow={r => ({ value: String(r.oid), label: String(r.kantor ?? r.oid ?? '') })}
            allowEmpty
            emptyLabel="Semua Kantor"
            placeholder="Semua Kantor"
            limit={20}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <SearchSelect
            value={aktif}
            onChange={v => { setPage(1); setAktif(v); }}
            options={[{ value: 'true', label: 'Aktif' }, { value: 'false', label: 'Nonaktif' }]}
            allowEmpty
            emptyLabel="Semua Status"
            placeholder="Semua Status"
          />
        </div>
      </div>

      <div className="datagrid-desktop">
        <WilayahPgTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} canManage={canManage} canDelete={canDelete} busyId={busyId} page={page} limit={limit} />
      </div>
      <WilayahPgCard data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} canManage={canManage} canDelete={canDelete} busyId={busyId} page={page} limit={limit} />

      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />

      {canManage && formRow !== undefined && (
        <WilayahPgForm
          row={formRow}
          onClose={() => setFormRow(undefined)}
          onSuccess={() => {
            setFormRow(undefined);
            mutate();
          }}
        />
      )}
    </div>
  );
}
