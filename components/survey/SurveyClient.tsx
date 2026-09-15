'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Plus } from 'lucide-react';
import { useSurveyList } from '@/hooks/useSurveyList';
import { SurveyTable } from '@/components/survey/SurveyTable';
import { SurveyCard } from '@/components/survey/SurveyCard';
import { SurveyForm } from '@/components/survey/SurveyForm';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import type { AjisSurvey, AjisSurveyListItem } from '@/types/survey';
import type { AnakDetail } from '@/types/anak';

const HASIL_OPTIONS = ['Layak', 'Tidak Layak'];

interface LockedAnak {
  idAnak: string;
  namaLengkap: string;
  alamat?: string | null;
  jenjangPendidikan?: string | null;
  noKartuKeluarga?: string | null;
}

export function SurveyClient() {
  const searchParams = useSearchParams();
  const idAnakParam = searchParams.get('id_anak');

  const [q, setQ] = useState('');
  const [hasilKesimpulan, setHasilKesimpulan] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);

  const { data, total, loading, mutate } = useSurveyList({
    q, hasil_kesimpulan_survey: hasilKesimpulan, page, limit,
  });

  const [formRow, setFormRow] = useState<AjisSurvey | null | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [lockedAnak, setLockedAnak] = useState<LockedAnak | null>(null);

  // Arrived from the Anak (Pengajuan Beasiswa) list's "Survey" row action
  // (?id_anak=...): fetch the anak's summary and auto-open the create form
  // with the picker locked, mirroring the Postgres SurveyPengelolaanClient.
  useEffect(() => {
    if (!idAnakParam) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/anakjuara/anak/${encodeURIComponent(idAnakParam)}`);
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error || 'Gagal memuat data anak.');
          return;
        }
        if (cancelled) return;
        const anak = json.data as AnakDetail;
        setLockedAnak({
          idAnak: anak.id_anak,
          namaLengkap: anak.nama_lengkap,
          alamat: anak.alamat,
          jenjangPendidikan: anak.jenjang_pendidikan,
          noKartuKeluarga: anak.no_kartu_keluarga,
        });
        setFormRow(null);
      } catch {
        if (!cancelled) toast.error('Gagal memuat data anak.');
      }
    })();
    return () => { cancelled = true; };
  }, [idAnakParam]);

  const openEdit = async (row: AjisSurveyListItem) => {
    setFormLoading(true);
    setLockedAnak(null);
    try {
      const res = await fetch(`/api/anakjuara/survey/${row.id_survey}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat detail survey.');
        return;
      }
      setFormRow(json.data as AjisSurvey);
    } catch {
      toast.error('Gagal memuat detail survey.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (row: AjisSurveyListItem) => {
    if (!confirm(`Hapus data survey untuk "${row.nama_lengkap ?? row.id_anak}"?`)) return;
    setBusyId(row.id_survey);
    try {
      const res = await fetch(`/api/anakjuara/survey/${row.id_survey}`, { method: 'DELETE' });
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A0A00' }}>Data Survey</h2>
          <p style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
            Kelola hasil survey rumah calon Anak Juara.
          </p>
        </div>
        <Btn variant="primary" disabled={formLoading} onClick={() => { setLockedAnak(null); setFormRow(null); }}>
          <Plus size={16} />
          Tambah Survey
        </Btn>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#7A6055' }} />
          <Input
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value); }}
            placeholder="Cari nama anak atau ID anak..."
            style={{ paddingLeft: 30 }}
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <SearchSelect
            value={hasilKesimpulan}
            onChange={v => { setPage(1); setHasilKesimpulan(v); }}
            options={HASIL_OPTIONS.map(o => ({ value: o, label: o }))}
            allowEmpty
            emptyLabel="Semua Hasil"
            placeholder="Semua Hasil"
          />
        </div>
      </div>

      <div className="datagrid-desktop">
        <SurveyTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} busyId={busyId} page={page} limit={limit} />
      </div>
      <SurveyCard data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} busyId={busyId} page={page} limit={limit} />

      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />

      {formRow !== undefined && (
        <SurveyForm
          row={formRow}
          lockedAnak={lockedAnak}
          onClose={() => { setFormRow(undefined); setLockedAnak(null); }}
          onSuccess={() => {
            setFormRow(undefined);
            setLockedAnak(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}
