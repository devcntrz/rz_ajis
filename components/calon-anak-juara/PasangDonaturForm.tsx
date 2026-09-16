'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { useTransaksiOptions } from '@/hooks/useTransaksi';
import { fmtRp } from '@/lib/utils';
import type { DonaturOption } from '@/types/input-donasi';

const T = { primaryPale: '#FBF0E8', gray: '#7A6055', grayLt: '#F2EAE3' };

const fetcher = (url: string) => fetch(url).then(r => r.json());

/** The minimal anak shape this form needs — reused from Calon Anak Juara and Peminjaman Anak. */
export interface PasangAnakTarget {
  id_anak: string;
  nama_anak: string;
  nama_kantor?: string | null;
}

interface Props {
  anak: PasangAnakTarget;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasangDonaturForm({ anak, onClose, onSuccess }: Props) {
  const [q, setQ] = useState('');
  const [donatur, setDonatur] = useState<DonaturOption | null>(null);
  const [idProgram, setIdProgram] = useState('');
  const [saving, setSaving] = useState(false);

  const { program, loading: programLoading } = useTransaksiOptions();
  const programOptions = useMemo(
    () => program.map(p => ({ value: String(p.id_program), label: `${p.nama_program} — ${fmtRp(p.harga_program)}` })),
    [program],
  );
  const namaProgram = program.find(p => String(p.id_program) === idProgram)?.nama_program ?? '';
  const donaturSearch = useSWR<{ data: DonaturOption[] }>(
    !donatur && q.trim().length >= 2 ? `/api/anakjuara/input-donasi/lookup/donatur?q=${encodeURIComponent(q)}` : null,
    fetcher,
  );

  const save = async () => {
    if (!donatur) { toast.error('Pilih donatur terlebih dahulu.'); return; }
    if (!namaProgram) { toast.error('Pilih program terlebih dahulu.'); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/anakjuara/calon-anak-juara/${encodeURIComponent(anak.id_anak)}/pasang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_donatur: donatur.did, nama_program: namaProgram }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal memasangkan anak ke donatur.'); return; }
      toast.success(json.message || 'Anak berhasil dipasangkan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Pasang ke Donatur — ${anak.nama_anak}`} onClose={onClose} maxWidth={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: T.primaryPale, borderRadius: 10, padding: 10, fontSize: 13 }}>
          <strong>{anak.nama_anak}</strong> · {anak.id_anak} · {anak.nama_kantor || '-'}
        </div>

        {!donatur && (
          <div>
            <FLabel>Cari Donatur (Nama / ID)</FLabel>
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Nama atau ID donatur…" />
            {q.trim().length >= 2 && (
              <div style={{ maxHeight: 180, overflowY: 'auto', border: `1.5px solid ${T.grayLt}`, borderRadius: 8, marginTop: 6 }}>
                {donaturSearch.isLoading && <div style={{ padding: 10, fontSize: 12, color: T.gray }}>Mencari…</div>}
                {!donaturSearch.isLoading && (donaturSearch.data?.data ?? []).map(d => (
                  <div
                    key={d.did}
                    onClick={() => setDonatur(d)}
                    style={{ padding: '7px 10px', fontSize: 13, cursor: 'pointer', borderBottom: `1px solid ${T.grayLt}` }}
                  >
                    <strong>{d.nama_lengkap}</strong> <span style={{ color: T.gray }}>({d.did}) — {d.kantor}</span>
                  </div>
                ))}
                {!donaturSearch.isLoading && (donaturSearch.data?.data ?? []).length === 0 && (
                  <div style={{ padding: 10, fontSize: 12, color: T.gray }}>Tidak ada donatur ditemukan.</div>
                )}
              </div>
            )}
          </div>
        )}

        {donatur && (
          <div style={{ background: T.primaryPale, borderRadius: 10, padding: 10, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{donatur.nama_lengkap}</strong> ({donatur.did}) — {donatur.kantor}</span>
            <Btn size="sm" variant="ghost" onClick={() => setDonatur(null)}>Ganti</Btn>
          </div>
        )}

        <div>
          <FLabel>Program Donasi</FLabel>
          <SearchSelect
            value={idProgram}
            onChange={setIdProgram}
            options={programOptions}
            disabled={programLoading}
            clearable
            limit={Math.max(programOptions.length, 1)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={saving || !donatur || !namaProgram}>
            {saving ? 'Menyimpan…' : 'Pasangkan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
