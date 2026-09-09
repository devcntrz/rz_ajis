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
import { useGroupUserList } from '@/hooks/useUserPgList';
import type { AjisUserPg, AjisUserPgInput } from '@/types/user-pg';

interface UserPgFormProps {
  row?: AjisUserPg | null;
  onClose: () => void;
  onSuccess: () => void;
  /** Only a Super Admin may assign the Super Admin role. */
  canAssignSuperAdmin: boolean;
}

const fieldStyle: React.CSSProperties = { marginBottom: 12 };

export function UserPgForm({ row, onClose, onSuccess, canAssignSuperAdmin }: UserPgFormProps) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: groupUsers } = useGroupUserList();

  const [username, setUsername] = useState(row?.username ?? '');
  const [email, setEmail] = useState(row?.email ?? '');
  const [nik, setNik] = useState(row?.nik ?? '');
  const [kantorId, setKantorId] = useState(row?.kantorId ?? '');
  const [namaKantor, setNamaKantor] = useState(row?.namaKantor ?? '');
  const [idWilayahPembinaan, setIdWilayahPembinaan] = useState(row?.idWilayahPembinaan?.toString() ?? '');
  const [namaWilayah, setNamaWilayah] = useState(row?.namaWilayah ?? '');
  const [idGroupUser, setIdGroupUser] = useState(row?.idGroupUser?.toString() ?? '');
  const [aktif, setAktif] = useState(row?.aktif ?? true);

  // Kantor -> Wilayah cascade, both as searchable (Select2-style) async pickers.
  // SearchSelect resolves the current value's label itself (via `resolvedLabel`
  // plus its own fetch-on-open), so no synthetic-option injection is needed here.

  const handleSubmit = async () => {
    setError('');
    if (!username.trim()) {
      setError('Username wajib diisi.');
      return;
    }
    if (idGroupUser === '1' && !canAssignSuperAdmin) {
      setError('Hanya Super Admin yang dapat menetapkan peran Super Admin.');
      return;
    }

    const body: AjisUserPgInput = {
      username: username.trim(),
      email: email.trim() || null,
      nik: nik.trim() || null,
      kantorId: kantorId.trim() || null,
      namaKantor: namaKantor.trim() || null,
      idWilayahPembinaan: idWilayahPembinaan ? Number(idWilayahPembinaan) : null,
      namaWilayah: namaWilayah.trim() || null,
      idGroupUser: idGroupUser ? Number(idGroupUser) : null,
      aktif,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/user/${row!.idUser}` : '/api/anakjuara/pg/user';
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
      toast.success(isEdit ? 'Data user berhasil diperbarui.' : 'Data user berhasil dibuat.');
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
    <Modal title={isEdit ? 'Edit User' : 'Tambah User'} onClose={saving ? () => {} : onClose} maxWidth={560}>
      <div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Username</FLabel>
            <Input value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Email</FLabel>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>NIK</FLabel>
            <Input value={nik} onChange={e => setNik(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Peran</FLabel>
            <SearchSelect
              value={idGroupUser}
              onChange={setIdGroupUser}
              placeholder="Pilih peran..."
              options={groupUsers
                .filter(g => g.idGroupUser !== 1 || canAssignSuperAdmin)
                .map(g => ({ value: String(g.idGroupUser), label: g.groupUser }))}
            />
          </div>
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Kantor</FLabel>
            <SearchSelect
              value={kantorId}
              onChange={(oid) => { setKantorId(oid); setIdWilayahPembinaan(''); setNamaWilayah(''); }}
              onLabelChange={setNamaKantor}
              resolvedLabel={namaKantor || undefined}
              fetchUrl="/api/anakjuara/pg/kantor/lookup"
              mapRow={r => ({ value: String(r.oid), label: String(r.kantor ?? r.oid ?? '') })}
              placeholder="Cari kantor..."
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Wilayah Pembinaan</FLabel>
            <SearchSelect
              key={kantorId}
              value={idWilayahPembinaan}
              onChange={setIdWilayahPembinaan}
              onLabelChange={setNamaWilayah}
              resolvedLabel={namaWilayah || undefined}
              fetchUrl={`/api/anakjuara/pg/wilayah/lookup${kantorId ? `?kantor_id=${encodeURIComponent(kantorId)}` : ''}`}
              mapRow={r => ({ value: String(r.idWilayahPembinaan), label: String(r.namaWilayah ?? '') })}
              placeholder={kantorId ? 'Cari wilayah...' : 'Pilih kantor dahulu'}
              disabled={!kantorId}
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
