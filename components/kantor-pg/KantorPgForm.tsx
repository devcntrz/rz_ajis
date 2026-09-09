'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import type { AjisKantorPg, AjisKantorPgCreateInput, AjisKantorPgInput } from '@/types/kantor-pg';

interface KantorPgFormProps {
  row?: AjisKantorPg | null;
  onClose: () => void;
  onSuccess: () => void;
}

const fieldStyle: React.CSSProperties = { marginBottom: 12 };

export function KantorPgForm({ row, onClose, onSuccess }: KantorPgFormProps) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [kantor, setKantor] = useState(row?.kantor ?? '');
  const [alamat, setAlamat] = useState(row?.alamat ?? '');
  const [noTelp, setNoTelp] = useState(row?.noTelp ?? '');
  const [oidParent, setOidParent] = useState(row?.oidParent ?? '');
  const [oidParentLabel, setOidParentLabel] = useState(row?.oidParent ?? '');
  const [oidParentSecond, setOidParentSecond] = useState(row?.oidParentSecond ?? '');
  const [jenis, setJenis] = useState(row?.jenis ?? '');

  const handleSubmit = async () => {
    setError('');
    if (!kantor.trim()) {
      setError('Nama kantor wajib diisi.');
      return;
    }

    // `oid` is never sent — server-generated on create (see route.ts POST) and
    // immutable on update.
    const body: AjisKantorPgInput | AjisKantorPgCreateInput = {
      kantor: kantor.trim(),
      alamat: alamat.trim() || null,
      noTelp: noTelp.trim() || null,
      oidParent: oidParent.trim() || null,
      oidParentSecond: oidParentSecond.trim() || null,
      jenis: jenis.trim() || null,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/kantor/${row!.id}` : '/api/anakjuara/pg/kantor';
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
      toast.success(isEdit ? 'Data kantor berhasil diperbarui.' : 'Data kantor berhasil dibuat.');
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
    <Modal title={isEdit ? 'Edit Kantor' : 'Tambah Kantor'} onClose={saving ? () => {} : onClose} maxWidth={560}>
      <div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Nama Kantor</FLabel>
            <Input value={kantor} onChange={e => setKantor(e.target.value)} />
          </div>
          {isEdit && (
            <div style={fieldStyle}>
              <FLabel>OID</FLabel>
              <Input value={row?.oid ?? ''} disabled />
            </div>
          )}
        </div>
        {!isEdit && (
          <div style={{ ...fieldStyle, fontSize: 12, color: '#7A6055', marginTop: -6 }}>
            Kode kantor (OID) akan dibuat otomatis.
          </div>
        )}
        <div style={fieldStyle}>
          <FLabel>Alamat</FLabel>
          <Input value={alamat} onChange={e => setAlamat(e.target.value)} />
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>No. Telp</FLabel>
            <Input value={noTelp} onChange={e => setNoTelp(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Jenis</FLabel>
            <Input value={jenis} onChange={e => setJenis(e.target.value)} />
          </div>
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Kantor Induk</FLabel>
            <SearchSelect
              value={oidParent}
              onChange={setOidParent}
              onLabelChange={setOidParentLabel}
              resolvedLabel={oidParentLabel || undefined}
              fetchUrl="/api/anakjuara/pg/kantor/lookup"
              mapRow={r => ({ value: String(r.oid), label: String(r.kantor ?? r.oid ?? '') })}
              placeholder="Cari kantor induk..."
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>OID Parent Kedua</FLabel>
            <Input value={oidParentSecond} onChange={e => setOidParentSecond(e.target.value)} />
          </div>
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
