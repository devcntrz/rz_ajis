'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { Toggle } from '@/components/ui/Toggle';
import type { AjisWilayahPg, AjisWilayahPgInput } from '@/types/wilayah-pg';

interface WilayahPgFormProps {
  row?: AjisWilayahPg | null;
  onClose: () => void;
  onSuccess: () => void;
}

const fieldStyle: React.CSSProperties = { marginBottom: 12 };

/** 'y' | 't' — lib/enums.ts STATUS_APPROVE. */
const STATUS_APPROVE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'y', label: 'Approved' },
  { value: 't', label: 'Pending' },
];

export function WilayahPgForm({ row, onClose, onSuccess }: WilayahPgFormProps) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [namaWilayah, setNamaWilayah] = useState(row?.namaWilayah ?? '');
  const [alamatWilayah, setAlamatWilayah] = useState(row?.alamatWilayah ?? '');
  const [kantorId, setKantorId] = useState(row?.kantorId ?? '');
  const [statusApprove, setStatusApprove] = useState(row?.statusApprove ?? '');
  const [kantorLabel, setKantorLabel] = useState(row?.namaKantor ?? '');
  const [namaPropinsi, setNamaPropinsi] = useState(row?.namaPropinsi ?? '');
  const [namaKabupaten, setNamaKabupaten] = useState(row?.namaKabupaten ?? '');
  const [namaKecamatan, setNamaKecamatan] = useState(row?.namaKecamatan ?? '');
  const [namaDesa, setNamaDesa] = useState(row?.namaDesa ?? '');
  const [aktif, setAktif] = useState(row?.aktif ?? true);

  // Propinsi -> Kabupaten -> Kecamatan -> Desa cascade. These ref_* codes aren't
  // columns on ajis_wilayah_pembinaan (only the denormalized nama_* text is), so
  // the codes only drive the cascade + label lookup; picking a level writes its
  // display name into the submitted nama_* field. An existing row only has the
  // legacy denormalized names with no known code, so the cascade starts empty in
  // edit mode — the "currently saved" summary line keeps the old values visible
  // until the user actively repicks.
  const [propid, setPropid] = useState('');
  const [kabid, setKabid] = useState('');
  const [camatid, setCamatid] = useState('');
  const [desaid, setDesaid] = useState('');
  const hasExistingWilayahText = isEdit && (namaPropinsi || namaKabupaten || namaKecamatan || namaDesa);

  const handleSubmit = async () => {
    setError('');
    if (!namaWilayah.trim()) {
      setError('Nama wilayah wajib diisi.');
      return;
    }

    const body: AjisWilayahPgInput = {
      namaWilayah: namaWilayah.trim(),
      alamatWilayah: alamatWilayah.trim() || null,
      kantorId: kantorId.trim() || null,
      statusApprove: statusApprove || null,
      namaPropinsi: namaPropinsi.trim() || null,
      namaKabupaten: namaKabupaten.trim() || null,
      namaKecamatan: namaKecamatan.trim() || null,
      namaDesa: namaDesa.trim() || null,
      aktif,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/wilayah/${row!.idWilayahPembinaan}` : '/api/anakjuara/pg/wilayah';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || 'Gagal menyimpan data.';
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(isEdit ? 'Data wilayah berhasil diperbarui.' : 'Data wilayah berhasil dibuat.');
      onSuccess();
    } catch {
      const msg = 'Gagal menyimpan data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Wilayah' : 'Tambah Wilayah'} onClose={saving ? () => {} : onClose} maxWidth={560}>
      <div>
        <div style={fieldStyle}>
          <FLabel>Nama Wilayah</FLabel>
          <Input value={namaWilayah} onChange={e => setNamaWilayah(e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <FLabel>Alamat Wilayah</FLabel>
          <Input value={alamatWilayah} onChange={e => setAlamatWilayah(e.target.value)} />
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Kantor</FLabel>
            <SearchSelect
              value={kantorId}
              onChange={setKantorId}
              onLabelChange={setKantorLabel}
              resolvedLabel={kantorLabel || undefined}
              fetchUrl="/api/anakjuara/pg/kantor/lookup"
              mapRow={r => ({ value: String(r.oid), label: String(r.kantor ?? r.oid ?? '') })}
              placeholder="Cari kantor..."
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Status Approve</FLabel>
            <SearchSelect
              value={statusApprove}
              onChange={setStatusApprove}
              options={STATUS_APPROVE_OPTIONS}
              allowEmpty
              emptyLabel="-"
              placeholder="Pilih status..."
            />
          </div>
        </div>

        {hasExistingWilayahText && (
          <div style={{ ...fieldStyle, fontSize: 12, color: '#7A6055' }}>
            Saat ini: {[namaPropinsi, namaKabupaten, namaKecamatan, namaDesa].filter(Boolean).join(', ') || '-'}
          </div>
        )}
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Propinsi</FLabel>
            <SearchSelect
              value={propid}
              onChange={(v) => { setPropid(v); setKabid(''); setCamatid(''); }}
              onLabelChange={setNamaPropinsi}
              fetchUrl="/api/anakjuara/pg/ref/propinsi/lookup"
              mapRow={r => ({ value: String(r.propid), label: String(r.propinsi ?? '') })}
              placeholder="Cari propinsi..."
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Kabupaten</FLabel>
            <SearchSelect
              key={propid}
              value={kabid}
              onChange={(v) => { setKabid(v); setCamatid(''); }}
              onLabelChange={setNamaKabupaten}
              fetchUrl={`/api/anakjuara/pg/ref/kabupaten/lookup${propid ? `?propid=${encodeURIComponent(propid)}` : ''}`}
              mapRow={r => ({ value: String(r.kabid), label: String(r.kabupaten ?? '') })}
              placeholder={propid ? 'Cari kabupaten...' : 'Pilih propinsi dahulu'}
              disabled={!propid}
              limit={20}
              clearable
            />
          </div>
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Kecamatan</FLabel>
            <SearchSelect
              key={kabid}
              value={camatid}
              onChange={setCamatid}
              onLabelChange={setNamaKecamatan}
              fetchUrl={`/api/anakjuara/pg/ref/kecamatan/lookup${kabid ? `?kabid=${encodeURIComponent(kabid)}` : ''}`}
              mapRow={r => ({ value: String(r.camatid), label: String(r.namaKecamatan ?? '') })}
              placeholder={kabid ? 'Cari kecamatan...' : 'Pilih kabupaten dahulu'}
              disabled={!kabid}
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Desa/Kelurahan</FLabel>
            <SearchSelect
              key={camatid}
              value={desaid}
              onChange={setDesaid}
              onLabelChange={setNamaDesa}
              fetchUrl={`/api/anakjuara/pg/ref/desa/lookup${camatid ? `?camatid=${encodeURIComponent(camatid)}` : ''}`}
              mapRow={r => ({ value: String(r.desaid), label: String(r.namaDesa ?? '') })}
              placeholder={camatid ? 'Cari desa...' : 'Pilih kecamatan dahulu'}
              disabled={!camatid}
              limit={20}
              clearable
            />
          </div>
        </div>
        <div style={fieldStyle}>
          <Toggle value={aktif} onChange={setAktif} label={aktif ? 'Aktif' : 'Nonaktif'} />
        </div>

        {error && (
          <div style={{
            background: '#FDEAEA', color: '#B02020', borderRadius: 10,
            padding: '10px 12px', fontSize: 13, fontWeight: 600, marginTop: 6,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Batal</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (<><Loader2 size={14} className="ajis-spin" /> Menyimpan...</>) : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
