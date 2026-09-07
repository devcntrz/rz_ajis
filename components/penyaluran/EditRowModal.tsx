'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input, Textarea } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import type { PenyaluranRow } from '@/types/penyaluran';

interface Props { row: PenyaluranRow; onClose: () => void; onSuccess: () => void; }

/** Fitur baru (PRD §5.5) — tidak ada di legacy. */
export function EditRowModal({ row, onClose, onSuccess }: Props) {
  const [nominalPenyaluran, setNominalPenyaluran] = useState(String(row.nominal_penyaluran));
  const [nominalHpp, setNominalHpp] = useState(String(row.nominal_hpp));
  const [bulan, setBulan] = useState(row.bulan);
  const [tahun, setTahun] = useState(row.tahun);
  const [alasan, setAlasan] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (alasan.trim().length < 5) { toast.error('Alasan wajib diisi, minimal 5 karakter.'); return; }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/anakjuara/penyaluran/${encodeURIComponent(row.id_penyaluran)}/rows/${row.id_row}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nominalPenyaluran: Number(nominalPenyaluran),
            nominalHpp: Number(nominalHpp),
            bulan: Number(bulan),
            tahun: Number(tahun),
            alasan,
          }),
        },
      );
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menyimpan.'); return; }
      toast.success(json.message || 'Baris diperbarui.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Edit Baris — ${row.nama_anak}`} onClose={onClose} maxWidth={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FLabel>Nominal Penyaluran</FLabel>
            <Input type="number" value={nominalPenyaluran} onChange={e => setNominalPenyaluran(e.target.value)} />
          </div>
          <div>
            <FLabel>Nominal HPP</FLabel>
            <Input type="number" value={nominalHpp} onChange={e => setNominalHpp(e.target.value)} />
          </div>
          <div>
            <FLabel>Bulan</FLabel>
            <Input type="number" value={bulan} onChange={e => setBulan(e.target.value)} />
          </div>
          <div>
            <FLabel>Tahun</FLabel>
            <Input type="number" value={tahun} onChange={e => setTahun(e.target.value)} />
          </div>
        </div>
        <div>
          <FLabel>Alasan (wajib)</FLabel>
          <Textarea value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Jelaskan alasan perubahan…" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Btn>
        </div>
      </div>
    </Modal>
  );
}
