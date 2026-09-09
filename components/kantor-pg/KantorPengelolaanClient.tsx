'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { useKantorPgList } from '@/hooks/useKantorPgList';
import { KantorPgTable } from '@/components/kantor-pg/KantorPgTable';
import { KantorPgCard } from '@/components/kantor-pg/KantorPgCard';
import { KantorPgForm } from '@/components/kantor-pg/KantorPgForm';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import type { AjisKantorPg, AjisKantorPgListItem } from '@/types/kantor-pg';

interface KantorPengelolaanClientProps {
  /** Only a Super Admin (id_group_user === 1) may create, edit or delete kantor —
   *  mirrors the POST/PUT/DELETE gating in the API routes. Every authenticated
   *  session can still read the full list. */
  isSuperAdmin: boolean;
}

export function KantorPengelolaanClient({ isSuperAdmin }: KantorPengelolaanClientProps) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);

  const { data, total, loading, mutate } = useKantorPgList({ q, page, limit });

  const [formRow, setFormRow] = useState<AjisKantorPg | null | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const openCreate = () => setFormRow(null);

  const openEdit = async (row: AjisKantorPgListItem) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/anakjuara/pg/kantor/${row.id}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat detail kantor.');
        return;
      }
      setFormRow(json.data as AjisKantorPg);
    } catch {
      toast.error('Gagal memuat detail kantor.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (row: AjisKantorPgListItem) => {
    if (!confirm(`Hapus kantor "${row.kantor ?? row.oid}"?`)) return;
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/anakjuara/pg/kantor/${row.id}`, { method: 'DELETE' });
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Master Kantor</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola data kantor cabang yang digunakan oleh Data Wilayah dan Manajemen User.
          </p>
        </div>
        {isSuperAdmin && (
          <Btn variant="primary" onClick={openCreate} disabled={formLoading}>
            <Plus size={16} />
            Tambah Kantor
          </Btn>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#7A6055' }} />
          <Input
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value); }}
            placeholder="Cari nama kantor, OID, atau alamat..."
            style={{ paddingLeft: 30 }}
          />
        </div>
      </div>

      <div className="datagrid-desktop">
        <KantorPgTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} canManage={isSuperAdmin} busyId={busyId} page={page} limit={limit} />
      </div>
      <KantorPgCard data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} canManage={isSuperAdmin} busyId={busyId} page={page} limit={limit} />

      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />

      {isSuperAdmin && formRow !== undefined && (
        <KantorPgForm
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
