'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input } from '@/components/ui/Input';
import type { Semester } from '@/types/semester';

interface SemesterFormProps {
  row?: Semester | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SemesterForm({ row, onClose, onSuccess }: SemesterFormProps) {
  const [semesterid, setSemesterid] = useState(row?.semesterid ?? '');
  const [semester, setSemester] = useState(row?.semester ?? '');
  const [tglAwal, setTglAwal] = useState(row?.tgl_awal?.slice(0, 10) ?? '');
  const [tglAkhir, setTglAkhir] = useState(row?.tgl_akhir?.slice(0, 10) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!row;

  const handleSubmit = async () => {
    setError('');
    if (!semesterid.trim() || !semester.trim() || !tglAwal || !tglAkhir) {
      setError('Semua field wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/semester/${row!.id}` : '/api/anakjuara/semester';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterid: semesterid.trim(),
          semester: semester.trim(),
          tgl_awal: tglAwal,
          tgl_akhir: tglAkhir,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || 'Gagal menyimpan semester.';
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(isEdit ? 'Semester berhasil diperbarui.' : 'Semester berhasil dibuat.');
      onSuccess();
    } catch {
      const msg = 'Gagal menyimpan semester.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Semester' : 'Tambah Semester'} onClose={saving ? () => {} : onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <FLabel>Semester ID</FLabel>
          <Input value={semesterid} onChange={e => setSemesterid(e.target.value)} placeholder="mis. 24" />
        </div>
        <div>
          <FLabel>Nama Semester</FLabel>
          <Input value={semester} onChange={e => setSemester(e.target.value)} placeholder="mis. Ganjil 2024/2025" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <FLabel>Tanggal Awal</FLabel>
            <Input type="date" value={tglAwal} onChange={e => setTglAwal(e.target.value)} />
          </div>
          <div>
            <FLabel>Tanggal Akhir</FLabel>
            <Input type="date" value={tglAkhir} onChange={e => setTglAkhir(e.target.value)} />
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FDEAEA', color: '#B02020', borderRadius: 10,
            padding: '10px 12px', fontSize: 13, fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (<><Loader2 size={14} className="ajis-spin" /> Menyimpan...</>) : 'Save'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
