'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { useAnakPgList } from '@/hooks/useAnakPgList';
import { AnakPgTable } from '@/components/anak-pg/AnakPgTable';
import { AnakPgCard } from '@/components/anak-pg/AnakPgCard';
import { AnakPgForm } from '@/components/anak-pg/AnakPgForm';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import type { AnakPg, AnakPgListItem } from '@/types/anak-pg';

const JENJANG_OPTIONS = ['sd', 'smp', 'sma', 'smk', 'mi', 'mts', 'ma', 'pt'];
const STATUS_AJ_OPTIONS = [
  { value: 'caj', label: 'Calon Anak Juara' },
  { value: 'aj', label: 'Anak Juara' },
  { value: 'non', label: 'Non Aktif' },
];

export function AnakPengajuanClient() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [statusAnakJuara, setStatusAnakJuara] = useState('');
  const [asnaf, setAsnaf] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);

  const { data, total, loading, mutate } = useAnakPgList({
    q, jenjang_pendidikan: jenjang, status_anak_juara: statusAnakJuara, asnaf, page, limit,
  });

  const [formRow, setFormRow] = useState<AnakPg | null | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openCreate = () => setFormRow(null);

  const openEdit = async (row: AnakPgListItem) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/anakjuara/pg/anak/${encodeURIComponent(row.idAnak)}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat detail anak.');
        return;
      }
      setFormRow(json.data as AnakPg);
    } catch {
      toast.error('Gagal memuat detail anak.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (row: AnakPgListItem) => {
    if (!confirm(`Hapus data pengajuan "${row.namaLengkap}"?`)) return;
    setBusyId(row.idAnak);
    try {
      const res = await fetch(`/api/anakjuara/pg/anak/${encodeURIComponent(row.idAnak)}`, { method: 'DELETE' });
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

  const handleSurvey = (row: AnakPgListItem) => {
    router.push(`/p/profiling/survey?id_anak=${encodeURIComponent(row.idAnak)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Pengajuan Beasiswa</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola data profil anak yang mengajukan beasiswa Anak Juara.
          </p>
        </div>
        <Btn variant="primary" onClick={openCreate} disabled={formLoading}>
          <Plus size={16} />
          Tambah Pengajuan
        </Btn>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#7A6055' }} />
          <Input
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value); }}
            placeholder="Cari nama atau ID anak..."
            style={{ paddingLeft: 30 }}
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <SearchSelect
            value={jenjang}
            onChange={v => { setPage(1); setJenjang(v); }}
            options={JENJANG_OPTIONS.map(j => ({ value: j, label: j.toUpperCase() }))}
            allowEmpty
            emptyLabel="Semua Jenjang"
            placeholder="Semua Jenjang"
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <SearchSelect
            value={statusAnakJuara}
            onChange={v => { setPage(1); setStatusAnakJuara(v); }}
            options={STATUS_AJ_OPTIONS}
            allowEmpty
            emptyLabel="Semua Status"
            placeholder="Semua Status"
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <Input value={asnaf} onChange={e => { setPage(1); setAsnaf(e.target.value); }} placeholder="Asnaf" />
        </div>
      </div>

      <div className="datagrid-desktop">
        <AnakPgTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} onSurvey={handleSurvey} busyId={busyId} page={page} limit={limit} />
      </div>
      <AnakPgCard data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} onSurvey={handleSurvey} busyId={busyId} page={page} limit={limit} />

      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />

      {formRow !== undefined && (
        <AnakPgForm
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
