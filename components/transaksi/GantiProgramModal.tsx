'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { useTransaksiOptions } from '@/hooks/useTransaksi';
import { fmtRp } from '@/lib/utils';
import type { Transaksi } from '@/types/transaksi';

interface Props {
  row:       Transaksi;
  onClose:   () => void;
  onSuccess: () => void;
}

/** Ganti Program (legacy `m=update_program`). */
export function GantiProgramModal({ row, onClose, onSuccess }: Props) {
  const { program, loading } = useTransaksiOptions();
  const [idProgram, setIdProgram] = useState(String(row.id_program ?? ''));
  const [saving, setSaving] = useState(false);

  const picked = program.find(p => String(p.id_program) === idProgram);
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
        `/api/anakjuara/transaksi/${encodeURIComponent(row.transid)}/${row.detailid}/program`,
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
          {row.transid} · {row.detailid} — {row.nama_donatur || row.did}
        </div>

        <div>
          <FLabel>Program saat ini</FLabel>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A0A00' }}>
            {row.nama_program || '-'} · {fmtRp(row.harga_program)}
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
            placeholder={loading ? 'Memuat…' : 'Ketik nama program…'}
          />
        </div>

        {picked && (
          <div style={{ fontSize: 11.5, color: '#7A6055' }}>
            Nama dan harga program pada transaksi akan disamakan dengan master{' '}
            <strong style={{ color: '#1A0A00' }}>{picked.nama_program}</strong>.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Batal</Btn>
          <Btn
            variant="primary"
            onClick={submit}
            disabled={saving || !idProgram || idProgram === String(row.id_program)}
          >
            {saving ? 'Menyimpan…' : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
