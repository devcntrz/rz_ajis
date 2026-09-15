'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { useTransaksiOptions } from '@/hooks/useTransaksi';
import { fmtRp } from '@/lib/utils';
import type { AnakJuaraRow } from '@/types/anak-juara';

interface Props {
  row:       AnakJuaraRow;
  onClose:   () => void;
  onSuccess: () => void;
}

/** Ganti Program di menu Anak Juara — hanya id_program/program_donasi di ajis_pemasangan. */
export function GantiProgramAnakJuaraModal({ row, onClose, onSuccess }: Props) {
  const { program, loading } = useTransaksiOptions();
  const [idProgram, setIdProgram] = useState(String(row.id_program ?? ''));
  const [saving, setSaving] = useState(false);

  const programOptions = useMemo(
    () => program.map(p => ({ value: String(p.id_program), label: `${p.nama_program} — ${fmtRp(p.harga_program)}` })),
    [program],
  );

  const submit = async () => {
    if (!idProgram) {
      toast.error('Pilih program terlebih dahulu.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/anakjuara/anak-juara/${encodeURIComponent(row.id_pemasangan_baru)}/program`,
        {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id_program: Number(idProgram) }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal mengganti program.');
        return;
      }
      toast.success(json.message || 'Program diubah.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Ganti Program" onClose={onClose} maxWidth={500}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ fontSize: 12, color: '#7A6055' }}>
          {row.id_anak} · {row.nama_anak}
        </div>

        <div>
          <FLabel>Program saat ini</FLabel>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A0A00' }}>
            {row.program_donasi || '-'}
          </div>
        </div>

        <div>
          <FLabel>Program baru</FLabel>
          <SearchSelect
            value={idProgram}
            onChange={setIdProgram}
            options={programOptions}
            disabled={loading}
            clearable
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Batal</Btn>
          <Btn variant="primary" onClick={submit} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
