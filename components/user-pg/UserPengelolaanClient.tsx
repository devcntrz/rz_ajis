'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { useUserPgList, useGroupUserList } from '@/hooks/useUserPgList';
import { UserPgTable } from '@/components/user-pg/UserPgTable';
import { UserPgCard } from '@/components/user-pg/UserPgCard';
import { UserPgForm } from '@/components/user-pg/UserPgForm';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import type { AjisUserPg, AjisUserPgListItem } from '@/types/user-pg';

interface UserPengelolaanClientProps {
  /** Only a Super Admin (id_group_user === 1) may delete users or assign the
   *  Super Admin role — mirrors the DELETE/PUT gating in the API routes. */
  isSuperAdmin: boolean;
}

export function UserPengelolaanClient({ isSuperAdmin }: UserPengelolaanClientProps) {
  const [q, setQ] = useState('');
  const [idGroupUser, setIdGroupUser] = useState('');
  const [aktif, setAktif] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);

  const { data, total, loading, mutate } = useUserPgList({
    q, id_group_user: idGroupUser, aktif, page, limit,
  });
  const { data: groupUsers } = useGroupUserList();

  const [formRow, setFormRow] = useState<AjisUserPg | null | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const openCreate = () => setFormRow(null);

  const openEdit = async (row: AjisUserPgListItem) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/anakjuara/pg/user/${row.idUser}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat detail user.');
        return;
      }
      setFormRow(json.data as AjisUserPg);
    } catch {
      toast.error('Gagal memuat detail user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (row: AjisUserPgListItem) => {
    if (!confirm(`Hapus user "${row.username}"?`)) return;
    setBusyId(row.idUser);
    try {
      const res = await fetch(`/api/anakjuara/pg/user/${row.idUser}`, { method: 'DELETE' });
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Manajemen User</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola akun pengguna AJIS beserta peran dan cakupan wilayah/kantornya.
          </p>
        </div>
        <Btn variant="primary" onClick={openCreate} disabled={formLoading}>
          <Plus size={16} />
          Tambah User
        </Btn>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#7A6055' }} />
          <Input
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value); }}
            placeholder="Cari username, kantor, atau wilayah..."
            style={{ paddingLeft: 30 }}
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <SearchSelect
            value={idGroupUser}
            onChange={v => { setPage(1); setIdGroupUser(v); }}
            options={groupUsers.map(g => ({ value: String(g.idGroupUser), label: g.groupUser }))}
            allowEmpty
            emptyLabel="Semua Peran"
            placeholder="Semua Peran"
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
        <UserPgTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} canDelete={isSuperAdmin} busyId={busyId} page={page} limit={limit} />
      </div>
      <UserPgCard data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} canDelete={isSuperAdmin} busyId={busyId} page={page} limit={limit} />

      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />

      {formRow !== undefined && (
        <UserPgForm
          row={formRow}
          canAssignSuperAdmin={isSuperAdmin}
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
