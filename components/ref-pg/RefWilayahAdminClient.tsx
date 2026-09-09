'use client';
/**
 * components/ref-pg/RefWilayahAdminClient.tsx — Setting Propinsi/Kab/Kec/Kel
 * (ref_propinsi, ref_kabupaten, ref_kecamatan, ref_desa). Postgres CRUD,
 * mirroring components/wilayah-pg/* conventions but using a single TabBar
 * to switch between the four levels, and a lighter table than the big
 * DataTable-with-sticky-columns pattern (small master tables).
 *
 * Add/Edit/Delete gated to Super Admin (idGroupUser === 1) via `canManage`;
 * everyone else with a session gets a read-only list.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, Loader2 } from 'lucide-react';
import { TabBar } from '@/components/ui/TabBar';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { Modal } from '@/components/ui/Modal';
import { FLabel } from '@/components/ui/FLabel';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { DesktopPagination, type PageSizeOption } from '@/components/ui/DesktopPagination';
import {
  usePropinsiPgList, usePropinsiLookup,
  useKabupatenPgList, useKabupatenLookup,
  useKecamatanPgList, useKecamatanLookup,
  useDesaPgList,
} from '@/hooks/useRefPgList';
import type {
  RefPropinsiPg, RefPropinsiPgInput,
  RefKabupatenPg, RefKabupatenPgInput,
  RefKecamatanPg, RefKecamatanPgInput,
  RefDesaPg, RefDesaPgInput,
} from '@/types/ref-pg';

interface RefWilayahAdminClientProps {
  canManage: boolean;
}

const T = {
  charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3',
  green: '#1A7A45', greenPale: '#E5F5ED', red: '#B02020', redPale: '#FDEAEA',
};

const TABS = [
  { id: 'propinsi', label: 'Propinsi' },
  { id: 'kabupaten', label: 'Kabupaten' },
  { id: 'kecamatan', label: 'Kecamatan' },
  { id: 'desa', label: 'Desa/Kelurahan' },
];

/* ---------------------------------------------------------------------- */
/* Shared list chrome                                                      */
/* ---------------------------------------------------------------------- */

function SimpleTable({ headers, rows, empty, loading, rowNumberStart }: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
  loading: boolean;
  /** 1-based number of the first displayed row, i.e. `(page - 1) * limit + 1`. */
  rowNumberStart: number;
}) {
  const allHeaders = ['No', ...headers];
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${T.grayLt}`, borderRadius: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#FBF0E8' }}>
            {allHeaders.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: T.charcoal, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={allHeaders.length} style={{ padding: 24, textAlign: 'center', color: T.gray }}><Loader2 size={16} className="ajis-spin" /> Memuat...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={allHeaders.length} style={{ padding: 24, textAlign: 'center', color: T.gray }}>{empty}</td></tr>
          ) : rows.map((cells, ri) => (
            <tr key={ri} style={{ borderTop: `1px solid ${T.grayLt}` }}>
              <td style={{ padding: '9px 12px', color: T.charcoal, verticalAlign: 'middle' }}>{rowNumberStart + ri}</td>
              {cells.map((c, ci) => (
                <td key={ci} style={{ padding: '9px 12px', color: T.charcoal, verticalAlign: 'middle' }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AktifBadge({ aktif }: { aktif: boolean }) {
  return aktif
    ? <Badge label="Aktif" color={T.green} bg={T.greenPale} />
    : <Badge label="Nonaktif" color={T.red} bg={T.redPale} />;
}

function Toolbar({ q, onQ, placeholder, canManage, onAdd, extra }: {
  q: string; onQ: (v: string) => void; placeholder: string;
  canManage: boolean; onAdd: () => void; extra?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: T.gray }} />
        <Input value={q} onChange={e => onQ(e.target.value)} placeholder={placeholder} style={{ paddingLeft: 30 }} />
      </div>
      {extra}
      {canManage && (
        <Btn variant="primary" onClick={onAdd}><Plus size={16} /> Tambah</Btn>
      )}
    </div>
  );
}

async function submitJson(url: string, method: 'POST' | 'PUT', body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal menyimpan data.');
  return json;
}

async function deleteRow(url: string) {
  const res = await fetch(url, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal menghapus data.');
  return json;
}

/* ---------------------------------------------------------------------- */
/* Propinsi                                                                 */
/* ---------------------------------------------------------------------- */

function PropinsiTab({ canManage }: { canManage: boolean }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);
  const { data, total, loading, mutate } = usePropinsiPgList({ q, page, limit });
  const [formRow, setFormRow] = useState<RefPropinsiPg | null | undefined>(undefined);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleDelete = async (row: RefPropinsiPg) => {
    if (!confirm(`Hapus propinsi "${row.propinsi}"?`)) return;
    setBusyId(row.id);
    try {
      await deleteRow(`/api/anakjuara/pg/ref/propinsi/${row.id}`);
      toast.success('Data berhasil dihapus.');
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus data.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <Toolbar q={q} onQ={v => { setPage(1); setQ(v); }} placeholder="Cari nama propinsi..." canManage={canManage} onAdd={() => setFormRow(null)} />
      <SimpleTable
        headers={['Propid', 'Nama Propinsi', 'Ibukota', 'Status', canManage ? 'Aksi' : ''].filter(Boolean)}
        empty="Belum ada data propinsi."
        loading={loading}
        rowNumberStart={(page - 1) * limit + 1}
        rows={data.map(r => [
          <span key="propid" style={{ fontWeight: 700 }}>{r.propid}</span>,
          r.propinsi,
          r.ibukota ?? '-',
          <AktifBadge key="aktif" aktif={r.aktif} />,
          ...(canManage ? [(
            <RowActions
              key="aksi"
              label={`Aksi untuk ${r.propinsi}`}
              items={[
                { label: 'Edit', onClick: () => setFormRow(r) },
                { label: 'Hapus', onClick: () => handleDelete(r), danger: true, disabled: busyId === r.id },
              ]}
            />
          )] : []),
        ])}
      />
      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />
      {canManage && formRow !== undefined && (
        <PropinsiForm row={formRow} onClose={() => setFormRow(undefined)} onSuccess={() => { setFormRow(undefined); mutate(); }} />
      )}
    </div>
  );
}

function PropinsiForm({ row, onClose, onSuccess }: {
  row?: RefPropinsiPg | null; onClose: () => void; onSuccess: () => void;
}) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [propid, setPropid] = useState(row?.propid ?? '');
  const [propinsi, setPropinsi] = useState(row?.propinsi ?? '');
  const [ibukota, setIbukota] = useState(row?.ibukota ?? '');
  const [aktif, setAktif] = useState(row?.aktif ?? true);

  const handleSubmit = async () => {
    setError('');
    if (!isEdit && !propid.trim()) { setError('Propid wajib diisi.'); return; }
    if (!propinsi.trim()) { setError('Nama propinsi wajib diisi.'); return; }

    const body: RefPropinsiPgInput = {
      ...(isEdit ? {} : { propid: propid.trim() }),
      propinsi: propinsi.trim(),
      ibukota: ibukota.trim() || null,
      aktif,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/ref/propinsi/${row!.id}` : '/api/anakjuara/pg/ref/propinsi';
      await submitJson(url, isEdit ? 'PUT' : 'POST', body);
      toast.success(isEdit ? 'Data propinsi berhasil diperbarui.' : 'Data propinsi berhasil dibuat.');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Propinsi' : 'Tambah Propinsi'} onClose={saving ? () => {} : onClose} maxWidth={480}>
      <div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Propid</FLabel>
          <Input value={propid} onChange={e => setPropid(e.target.value)} disabled={isEdit} placeholder="mis. 32" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Nama Propinsi</FLabel>
          <Input value={propinsi} onChange={e => setPropinsi(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Ibukota</FLabel>
          <Input value={ibukota} onChange={e => setIbukota(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Toggle value={aktif} onChange={setAktif} label={aktif ? 'Aktif' : 'Nonaktif'} />
        </div>
        {error && <ErrorBox msg={error} />}
        <FormActions saving={saving} onCancel={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Kabupaten                                                                */
/* ---------------------------------------------------------------------- */

function KabupatenTab({ canManage }: { canManage: boolean }) {
  const [q, setQ] = useState('');
  const [propidFilter, setPropidFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);
  const { data, total, loading, mutate } = useKabupatenPgList({ q, propid: propidFilter, page, limit });
  const { data: propinsiOptions } = usePropinsiLookup();
  const [formRow, setFormRow] = useState<RefKabupatenPg | null | undefined>(undefined);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleDelete = async (row: RefKabupatenPg) => {
    if (!confirm(`Hapus kabupaten "${row.kabupaten}"?`)) return;
    setBusyId(row.id);
    try {
      await deleteRow(`/api/anakjuara/pg/ref/kabupaten/${row.id}`);
      toast.success('Data berhasil dihapus.');
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus data.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <Toolbar
        q={q} onQ={v => { setPage(1); setQ(v); }} placeholder="Cari nama kabupaten..." canManage={canManage} onAdd={() => setFormRow(null)}
        extra={
          <div style={{ minWidth: 180 }}>
            <SearchSelect
              value={propidFilter}
              onChange={v => { setPage(1); setPropidFilter(v); }}
              options={propinsiOptions.map(p => ({ value: p.propid, label: p.propinsi }))}
              allowEmpty
              emptyLabel="Semua Propinsi"
              placeholder="Semua Propinsi"
            />
          </div>
        }
      />
      <SimpleTable
        headers={['Kabid', 'Nama Kabupaten/Kota', 'Propinsi', 'Jenis', 'Status', canManage ? 'Aksi' : ''].filter(Boolean)}
        empty="Belum ada data kabupaten."
        loading={loading}
        rowNumberStart={(page - 1) * limit + 1}
        rows={data.map(r => [
          <span key="kabid" style={{ fontWeight: 700 }}>{r.kabid}</span>,
          r.kabupaten,
          r.namaPropinsi ?? '-',
          r.kota ? 'Kota' : 'Kabupaten',
          <AktifBadge key="aktif" aktif={r.aktif} />,
          ...(canManage ? [(
            <RowActions
              key="aksi"
              label={`Aksi untuk ${r.kabupaten}`}
              items={[
                { label: 'Edit', onClick: () => setFormRow(r) },
                { label: 'Hapus', onClick: () => handleDelete(r), danger: true, disabled: busyId === r.id },
              ]}
            />
          )] : []),
        ])}
      />
      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />
      {canManage && formRow !== undefined && (
        <KabupatenForm row={formRow} onClose={() => setFormRow(undefined)} onSuccess={() => { setFormRow(undefined); mutate(); }} />
      )}
    </div>
  );
}

function KabupatenForm({ row, onClose, onSuccess }: {
  row?: RefKabupatenPg | null; onClose: () => void; onSuccess: () => void;
}) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [propid, setPropid] = useState(row?.propid ?? '');
  const [kabupaten, setKabupaten] = useState(row?.kabupaten ?? '');
  const [kota, setKota] = useState(row?.kota ?? false);
  const [ibukota, setIbukota] = useState(row?.ibukota ?? '');
  const [aktif, setAktif] = useState(row?.aktif ?? true);

  const { data: propinsiOptions } = usePropinsiLookup();

  const handleSubmit = async () => {
    setError('');
    if (!propid.trim()) { setError('Propinsi wajib dipilih.'); return; }
    if (!kabupaten.trim()) { setError('Nama kabupaten wajib diisi.'); return; }

    // kabid is server-generated (lib/refPg/generateCodes.ts) — never sent
    // from the client, so the form doesn't need to predict it before saving.
    const body: RefKabupatenPgInput = {
      propid: propid.trim(),
      kabupaten: kabupaten.trim(),
      kota,
      ibukota: ibukota.trim() || null,
      aktif,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/ref/kabupaten/${row!.id}` : '/api/anakjuara/pg/ref/kabupaten';
      await submitJson(url, isEdit ? 'PUT' : 'POST', body);
      toast.success(isEdit ? 'Data kabupaten berhasil diperbarui.' : 'Data kabupaten berhasil dibuat.');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Kabupaten' : 'Tambah Kabupaten'} onClose={saving ? () => {} : onClose} maxWidth={520}>
      <div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Propinsi</FLabel>
          <SearchSelect
            value={propid}
            onChange={setPropid}
            options={propinsiOptions.map(p => ({ value: p.propid, label: p.propinsi }))}
            placeholder="Pilih propinsi..."
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Nama Kabupaten/Kota</FLabel>
          <Input value={kabupaten} onChange={e => setKabupaten(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Ibukota</FLabel>
          <Input value={ibukota} onChange={e => setIbukota(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <Toggle value={kota} onChange={setKota} label={kota ? 'Kota' : 'Kabupaten'} />
          <Toggle value={aktif} onChange={setAktif} label={aktif ? 'Aktif' : 'Nonaktif'} />
        </div>
        {error && <ErrorBox msg={error} />}
        <FormActions saving={saving} onCancel={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Kecamatan                                                                */
/* ---------------------------------------------------------------------- */

function KecamatanTab({ canManage }: { canManage: boolean }) {
  const [q, setQ] = useState('');
  const [kabidFilter, setKabidFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);
  const { data, total, loading, mutate } = useKecamatanPgList({ q, kabid: kabidFilter, page, limit });
  const { data: kabupatenOptions } = useKabupatenLookup();
  const [formRow, setFormRow] = useState<RefKecamatanPg | null | undefined>(undefined);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleDelete = async (row: RefKecamatanPg) => {
    if (!confirm(`Hapus kecamatan "${row.namaKecamatan}"?`)) return;
    setBusyId(row.id);
    try {
      await deleteRow(`/api/anakjuara/pg/ref/kecamatan/${row.id}`);
      toast.success('Data berhasil dihapus.');
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus data.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <Toolbar
        q={q} onQ={v => { setPage(1); setQ(v); }} placeholder="Cari nama kecamatan..." canManage={canManage} onAdd={() => setFormRow(null)}
        extra={
          <div style={{ minWidth: 180 }}>
            <SearchSelect
              value={kabidFilter}
              onChange={v => { setPage(1); setKabidFilter(v); }}
              options={kabupatenOptions.map(k => ({ value: k.kabid, label: k.kabupaten }))}
              allowEmpty
              emptyLabel="Semua Kabupaten"
              placeholder="Semua Kabupaten"
            />
          </div>
        }
      />
      <SimpleTable
        headers={['Camatid', 'Nama Kecamatan', 'Kabupaten', 'Kodepos', 'Status', canManage ? 'Aksi' : ''].filter(Boolean)}
        empty="Belum ada data kecamatan."
        loading={loading}
        rowNumberStart={(page - 1) * limit + 1}
        rows={data.map(r => [
          <span key="camatid" style={{ fontWeight: 700 }}>{r.camatid}</span>,
          r.namaKecamatan,
          r.namaKabupaten ?? '-',
          r.kodepos ?? '-',
          <AktifBadge key="aktif" aktif={r.aktif} />,
          ...(canManage ? [(
            <RowActions
              key="aksi"
              label={`Aksi untuk ${r.namaKecamatan}`}
              items={[
                { label: 'Edit', onClick: () => setFormRow(r) },
                { label: 'Hapus', onClick: () => handleDelete(r), danger: true, disabled: busyId === r.id },
              ]}
            />
          )] : []),
        ])}
      />
      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />
      {canManage && formRow !== undefined && (
        <KecamatanForm row={formRow} onClose={() => setFormRow(undefined)} onSuccess={() => { setFormRow(undefined); mutate(); }} />
      )}
    </div>
  );
}

function KecamatanForm({ row, onClose, onSuccess }: {
  row?: RefKecamatanPg | null; onClose: () => void; onSuccess: () => void;
}) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Two-level cascade: Propinsi narrows the Kabupaten picker (Kecamatan has
  // no propid column itself, only kabid — mirrors the Kantor→Wilayah cascade
  // pattern in WilayahPgForm.tsx / UserPgForm.tsx).
  const [propid, setPropid] = useState('');
  const [kabid, setKabid] = useState(row?.kabid ?? '');
  const [namaKecamatan, setNamaKecamatan] = useState(row?.namaKecamatan ?? '');
  const [kodepos, setKodepos] = useState(row?.kodepos ?? '');
  const [aktif, setAktif] = useState(row?.aktif ?? true);

  const { data: propinsiOptions } = usePropinsiLookup();
  const { data: kabupatenOptions } = useKabupatenLookup(undefined, propid);

  const handleSubmit = async () => {
    setError('');
    if (!kabid.trim()) { setError('Kabupaten wajib dipilih.'); return; }
    if (!namaKecamatan.trim()) { setError('Nama kecamatan wajib diisi.'); return; }

    // camatid is server-generated (lib/refPg/generateCodes.ts) — never sent
    // from the client.
    const body: RefKecamatanPgInput = {
      kabid: kabid.trim(),
      namaKecamatan: namaKecamatan.trim(),
      kodepos: kodepos.trim() || null,
      aktif,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/ref/kecamatan/${row!.id}` : '/api/anakjuara/pg/ref/kecamatan';
      await submitJson(url, isEdit ? 'PUT' : 'POST', body);
      toast.success(isEdit ? 'Data kecamatan berhasil diperbarui.' : 'Data kecamatan berhasil dibuat.');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Kecamatan' : 'Tambah Kecamatan'} onClose={saving ? () => {} : onClose} maxWidth={520}>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <FLabel>Propinsi</FLabel>
            <SearchSelect
              value={propid}
              onChange={(v) => { setPropid(v); setKabid(''); }}
              options={propinsiOptions.map(p => ({ value: p.propid, label: p.propinsi }))}
              placeholder="Pilih propinsi..."
            />
          </div>
          <div>
            <FLabel>Kabupaten</FLabel>
            <SearchSelect
              value={kabid}
              onChange={setKabid}
              options={kabupatenOptions.map(k => ({ value: k.kabid, label: k.kabupaten }))}
              disabled={!propid && !isEdit}
              placeholder="Pilih kabupaten..."
            />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Nama Kecamatan</FLabel>
          <Input value={namaKecamatan} onChange={e => setNamaKecamatan(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Kodepos</FLabel>
          <Input value={kodepos} onChange={e => setKodepos(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Toggle value={aktif} onChange={setAktif} label={aktif ? 'Aktif' : 'Nonaktif'} />
        </div>
        {error && <ErrorBox msg={error} />}
        <FormActions saving={saving} onCancel={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Desa / Kelurahan                                                        */
/* ---------------------------------------------------------------------- */

function DesaTab({ canManage }: { canManage: boolean }) {
  const [q, setQ] = useState('');
  const [camatidFilter, setCamatidFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSizeOption>(10);
  const { data, total, loading, mutate } = useDesaPgList({ q, camatid: camatidFilter, page, limit });
  const { data: kecamatanOptions } = useKecamatanLookup();
  const [formRow, setFormRow] = useState<RefDesaPg | null | undefined>(undefined);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleDelete = async (row: RefDesaPg) => {
    if (!confirm(`Hapus ${row.kelurahan ? 'kelurahan' : 'desa'} "${row.namaDesa}"?`)) return;
    setBusyId(row.id);
    try {
      await deleteRow(`/api/anakjuara/pg/ref/desa/${row.id}`);
      toast.success('Data berhasil dihapus.');
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus data.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <Toolbar
        q={q} onQ={v => { setPage(1); setQ(v); }} placeholder="Cari nama desa/kelurahan..." canManage={canManage} onAdd={() => setFormRow(null)}
        extra={
          <div style={{ minWidth: 180 }}>
            <SearchSelect
              value={camatidFilter}
              onChange={v => { setPage(1); setCamatidFilter(v); }}
              options={kecamatanOptions.map(c => ({ value: c.camatid, label: c.namaKecamatan }))}
              allowEmpty
              emptyLabel="Semua Kecamatan"
              placeholder="Semua Kecamatan"
            />
          </div>
        }
      />
      <SimpleTable
        headers={['Desaid', 'Nama', 'Jenis', 'Kecamatan', 'Status', canManage ? 'Aksi' : ''].filter(Boolean)}
        empty="Belum ada data desa/kelurahan."
        loading={loading}
        rowNumberStart={(page - 1) * limit + 1}
        rows={data.map(r => [
          <span key="desaid" style={{ fontWeight: 700 }}>{r.desaid}</span>,
          r.namaDesa,
          r.kelurahan ? 'Kelurahan' : 'Desa',
          r.namaKecamatan ?? '-',
          <AktifBadge key="aktif" aktif={r.aktif} />,
          ...(canManage ? [(
            <RowActions
              key="aksi"
              label={`Aksi untuk ${r.namaDesa}`}
              items={[
                { label: 'Edit', onClick: () => setFormRow(r) },
                { label: 'Hapus', onClick: () => handleDelete(r), danger: true, disabled: busyId === r.id },
              ]}
            />
          )] : []),
        ])}
      />
      <DesktopPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={l => { setPage(1); setLimit(l); }}
      />
      {canManage && formRow !== undefined && (
        <DesaForm row={formRow} onClose={() => setFormRow(undefined)} onSuccess={() => { setFormRow(undefined); mutate(); }} />
      )}
    </div>
  );
}

function DesaForm({ row, onClose, onSuccess }: {
  row?: RefDesaPg | null; onClose: () => void; onSuccess: () => void;
}) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Three-level cascade: Propinsi → Kabupaten → Kecamatan.
  const [propid, setPropid] = useState('');
  const [kabid, setKabid] = useState('');
  const [camatid, setCamatid] = useState(row?.camatid ?? '');
  const [namaDesa, setNamaDesa] = useState(row?.namaDesa ?? '');
  const [kelurahan, setKelurahan] = useState(row?.kelurahan ?? false);
  const [nomorIndukDesa, setNomorIndukDesa] = useState(row?.nomorIndukDesa ?? '');
  const [aktif, setAktif] = useState(row?.aktif ?? true);

  const { data: propinsiOptions } = usePropinsiLookup();
  const { data: kabupatenOptions } = useKabupatenLookup(undefined, propid);
  const { data: kecamatanOptions } = useKecamatanLookup(undefined, kabid);

  const handleSubmit = async () => {
    setError('');
    if (!camatid.trim()) { setError('Kecamatan wajib dipilih.'); return; }
    if (!namaDesa.trim()) { setError('Nama desa/kelurahan wajib diisi.'); return; }

    // desaid is server-generated (lib/refPg/generateCodes.ts) — never sent
    // from the client. propid/kabid are denormalized server-side from camatid.
    const body: RefDesaPgInput = {
      camatid: camatid.trim(),
      namaDesa: namaDesa.trim(),
      kelurahan,
      nomorIndukDesa: nomorIndukDesa.trim() || null,
      aktif,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/ref/desa/${row!.id}` : '/api/anakjuara/pg/ref/desa';
      await submitJson(url, isEdit ? 'PUT' : 'POST', body);
      toast.success(isEdit ? 'Data desa berhasil diperbarui.' : 'Data desa berhasil dibuat.');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Desa/Kelurahan' : 'Tambah Desa/Kelurahan'} onClose={saving ? () => {} : onClose} maxWidth={560}>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <FLabel>Propinsi</FLabel>
            <SearchSelect
              value={propid}
              onChange={(v) => { setPropid(v); setKabid(''); setCamatid(''); }}
              options={propinsiOptions.map(p => ({ value: p.propid, label: p.propinsi }))}
              placeholder="Pilih..."
            />
          </div>
          <div>
            <FLabel>Kabupaten</FLabel>
            <SearchSelect
              value={kabid}
              onChange={(v) => { setKabid(v); setCamatid(''); }}
              options={kabupatenOptions.map(k => ({ value: k.kabid, label: k.kabupaten }))}
              disabled={!propid && !isEdit}
              placeholder="Pilih..."
            />
          </div>
          <div>
            <FLabel>Kecamatan</FLabel>
            <SearchSelect
              value={camatid}
              onChange={setCamatid}
              options={kecamatanOptions.map(c => ({ value: c.camatid, label: c.namaKecamatan }))}
              disabled={!kabid && !isEdit}
              placeholder="Pilih..."
            />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Nama Desa/Kelurahan</FLabel>
          <Input value={namaDesa} onChange={e => setNamaDesa(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <FLabel>Nomor Induk Desa</FLabel>
          <Input value={nomorIndukDesa} onChange={e => setNomorIndukDesa(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <Toggle value={kelurahan} onChange={setKelurahan} label={kelurahan ? 'Kelurahan' : 'Desa'} />
          <Toggle value={aktif} onChange={setAktif} label={aktif ? 'Aktif' : 'Nonaktif'} />
        </div>
        {error && <ErrorBox msg={error} />}
        <FormActions saving={saving} onCancel={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/* Shared form bits                                                         */
/* ---------------------------------------------------------------------- */

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ background: T.redPale, color: T.red, borderRadius: 10, padding: '10px 12px', fontSize: 13, fontWeight: 600, marginTop: 6 }}>
      {msg}
    </div>
  );
}

function FormActions({ saving, onCancel, onSubmit }: { saving: boolean; onCancel: () => void; onSubmit: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
      <Btn variant="ghost" onClick={onCancel} disabled={saving}>Batal</Btn>
      <Btn variant="primary" onClick={onSubmit} disabled={saving}>
        {saving ? (<><Loader2 size={14} className="ajis-spin" /> Menyimpan...</>) : 'Simpan'}
      </Btn>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Root                                                                     */
/* ---------------------------------------------------------------------- */

export function RefWilayahAdminClient({ canManage }: RefWilayahAdminClientProps) {
  const [tab, setTab] = useState('propinsi');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.charcoal }}>Setting Propinsi/Kab/Kec/Kel</h2>
        <p style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
          Kelola data referensi administratif (propinsi, kabupaten/kota, kecamatan, desa/kelurahan) yang digunakan di seluruh sistem.
        </p>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'propinsi' && <PropinsiTab canManage={canManage} />}
      {tab === 'kabupaten' && <KabupatenTab canManage={canManage} />}
      {tab === 'kecamatan' && <KecamatanTab canManage={canManage} />}
      {tab === 'desa' && <DesaTab canManage={canManage} />}
    </div>
  );
}
