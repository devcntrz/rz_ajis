'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Sel, Textarea } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import type { AnakJuaraRow } from '@/types/anak-juara';
import type { CreateAjuanPayload, TipeGanti } from '@/types/ajuan';

interface AjuanGantiAnakFormProps {
  row: AnakJuaraRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function AjuanGantiAnakForm({ row, onClose, onSuccess }: AjuanGantiAnakFormProps) {
  const [tipeGanti, setTipeGanti] = useState<TipeGanti>('pemasangan_baru');
  const [anakPengganti, setAnakPengganti] = useState('');
  const [namaPengganti, setNamaPengganti] = useState('');
  const [alasan, setAlasan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [pindahSaldo, setPindahSaldo] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const optionsUrl = tipeGanti === 'anak_existing'
    ? '/api/anakjuara/ajuan-ganti-anak/options/anak-existing'
    : '/api/anakjuara/ajuan-ganti-anak/options/anak-calon';

  const handleTipeChange = (v: TipeGanti) => {
    setTipeGanti(v);
    setAnakPengganti('');
    setNamaPengganti('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!alasan.trim()) {
      setError('Alasan pergantian wajib diisi.');
      return;
    }
    if (!anakPengganti) {
      setError('Anak pengganti wajib dipilih.');
      return;
    }

    const payload: CreateAjuanPayload = {
      id_pemasangan_baru:   row.id_pemasangan_baru,
      id_kantor:            row.id_kantor,
      nama_kantor:          row.nama_kantor,
      id_wilayah_pembinaan: String(row.id_wilayah_pembinaan),
      nama_wilayah:         row.nama_wilayah,
      id_donatur:           row.id_donatur,
      nama_donatur:         row.nama_donatur,
      program_donasi:       row.program_donasi,
      nia_rfo:              row.nia_rfo,
      nama_rfo:             row.nama_rfo,
      id_anak_asal:         row.id_anak,
      nama_anak_asal:       row.nama_anak,
      jns_kelamin:          row.jns_kel,
      alasan_pergantian:    alasan.trim(),
      id_anak_pengganti:    anakPengganti,
      nama_anak_pengganti:  namaPengganti || anakPengganti,
      tipe_ganti:           tipeGanti,
      keterangan:           keterangan.trim(),
      pindah_saldo:         Number(pindahSaldo) || 0,
      jcustid:              String(row.jcustid ?? ''),
    };

    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/ajuan-ganti-anak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Gagal menyimpan ajuan.');
        return;
      }
      onSuccess();
    } catch {
      setError('Gagal menyimpan ajuan.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string) => (
    <div>
      <FLabel>{label}</FLabel>
      <Input value={value || '—'} disabled />
    </div>
  );

  return (
    <Modal title="+ Ajuan Ganti Anak" onClose={onClose} maxWidth={720}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12,
        }}>
          {field('ID Pasang', row.id_pemasangan_baru)}
          {field('Kantor', row.nama_kantor)}
          {field('Wilayah', row.nama_wilayah)}
          {field('Donatur', `${row.nama_donatur} (${row.id_donatur})`)}
          {field('Funding', `${row.nama_rfo} (${row.nia_rfo})`)}
          {field('Program', row.program_donasi)}
          {field('Anak Asal', `${row.nama_anak} (${row.id_anak})`)}
        </div>

        <div>
          <FLabel>Alasan Pergantian *</FLabel>
          <Textarea
            value={alasan}
            onChange={e => setAlasan(e.target.value)}
            rows={2}
            placeholder="Wajib diisi"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <FLabel>Tipe Ganti *</FLabel>
            <Sel
              value={tipeGanti}
              onChange={e => handleTipeChange(e.target.value as TipeGanti)}
            >
              <option value="pemasangan_baru">Pemasangan Baru (CAJ)</option>
              <option value="anak_existing">Anak Existing (nonaktif)</option>
            </Sel>
          </div>
          <div>
            <FLabel>Pindah Saldo</FLabel>
            <Input
              type="number"
              value={pindahSaldo}
              onChange={e => setPindahSaldo(e.target.value)}
            />
          </div>
        </div>

        <div>
          <FLabel>Anak Pengganti *</FLabel>
          <SearchSelect
            key={tipeGanti}
            fetchUrl={optionsUrl}
            value={anakPengganti}
            onChange={setAnakPengganti}
            onLabelChange={setNamaPengganti}
            resolvedLabel={namaPengganti}
            placeholder="Cari anak pengganti..."
            clearable
          />
        </div>

        <div>
          <FLabel>Keterangan</FLabel>
          <Textarea
            value={keterangan}
            onChange={e => setKeterangan(e.target.value)}
            rows={2}
          />
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
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Batal</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Ajuan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
