'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Sel, Textarea } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import type { DonaturSnapshot } from '@/lib/donatur';
import type { AnakJuaraRow } from '@/types/anak-juara';
import type { CreateAjuanPayload, TipeGanti } from '@/types/ajuan';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AjuanGantiAnakFormProps {
  row: AnakJuaraRow;
  onClose: () => void;
  onSuccess: () => void;
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, color: '#8F3A01',
  textTransform: 'uppercase', letterSpacing: 0.5,
  paddingBottom: 8, borderBottom: '1px solid #F0C4A0', marginBottom: 12,
};

const INVALID: React.CSSProperties = {
  borderColor: '#B02020',
  background: '#FDEAEA',
};

/** Read-only display field. */
function Ro({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <Input value={value == null || value === '' ? '—' : String(value)} disabled />
    </div>
  );
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
  const [submitted, setSubmitted] = useState(false);

  // Donor extras are not on the Anak Juara row; fetched only when this modal opens
  // so the list query stays lean. Display only — the server re-reads them on save.
  const { data: donaturRes } = useSWR<{ data: DonaturSnapshot }>(
    row.id_donatur
      ? `/api/anakjuara/ajuan-ganti-anak/options/donatur?id_donatur=${encodeURIComponent(row.id_donatur)}`
      : null,
    fetcher,
    { revalidateOnFocus: false },
  );
  const donatur = donaturRes?.data;

  const optionsUrl = tipeGanti === 'anak_existing'
    ? '/api/anakjuara/ajuan-ganti-anak/options/anak-existing'
    : '/api/anakjuara/ajuan-ganti-anak/options/anak-calon';

  const handleTipeChange = (v: TipeGanti) => {
    setTipeGanti(v);
    setAnakPengganti('');
    setNamaPengganti('');
  };

  const alasanInvalid = submitted && !alasan.trim();
  const penggantiInvalid = submitted && !anakPengganti;

  const handleSubmit = async () => {
    setError('');
    setSubmitted(true);
    if (!alasan.trim() || !anakPengganti) {
      setError('Alasan pergantian dan anak pengganti wajib diisi.');
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

  const tglAjuan = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    // Closing mid-save would leave the operator unsure whether the ajuan landed.
    <Modal title="Entry Ajuan Ganti" onClose={saving ? () => {} : onClose} maxWidth={920}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 18,
        pointerEvents: saving ? 'none' : undefined,
        opacity: saving ? 0.6 : 1,
        transition: 'opacity .15s',
      }}>
        {/* Identitas pemasangan — 3 kolom, runtuh jadi 1 di layar sempit */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}>
          <Ro label="Id Pasang" value={row.id_pemasangan_baru} />
          <Ro label="ID Donatur" value={row.id_donatur} />
          <Ro label="Program beasiswa" value={row.program_donasi} />

          <Ro label="Id Kantor" value={row.id_kantor} />
          <Ro label="oID Donatur" value={donatur?.oid_donatur} />
          <Ro label="Jenis Donatur" value={donatur?.jenis_donatur} />

          <Ro label="Kantor Cabang" value={row.nama_kantor} />
          <Ro label="Nama Donatur" value={row.nama_donatur} />
          <Ro label="No HP" value={donatur?.hp} />

          <Ro label="ID Wilayah" value={row.id_wilayah_pembinaan} />
          <Ro label="Id Funding" value={row.nia_rfo} />
          <div>
            <FLabel>Pindah Saldo</FLabel>
            <Input
              type="number"
              value={pindahSaldo}
              onChange={e => setPindahSaldo(e.target.value)}
              style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
            />
          </div>

          <Ro label="Wilayah Binaan" value={row.nama_wilayah} />
          <Ro label="Nama Funding" value={row.nama_rfo} />
          <div />

          {/* Legacy shows a datebox, but the INSERT always uses NOW() (PRD §5.1),
              so an editable date would only mislead the operator. */}
          <Ro label="Tanggal Ajuan" value={tglAjuan} />
          <Ro label="Kantor Donatur" value={donatur?.kantor_donatur} />
        </div>

        {/* ANAK ASAL */}
        <div>
          <div style={SECTION_TITLE}>Anak Asal</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}>
            <Ro label="ID Anak" value={row.id_anak} />
            <Ro label="Nama Anak Juara" value={row.nama_anak} />
          </div>
          <div style={{ marginTop: 12 }}>
            <FLabel>Alasan Pergantian *</FLabel>
            <Textarea
              value={alasan}
              onChange={e => setAlasan(e.target.value)}
              rows={2}
              placeholder="Wajib diisi"
              style={alasanInvalid ? INVALID : undefined}
            />
          </div>
        </div>

        {/* ANAK PENGGANTI */}
        <div>
          <div style={SECTION_TITLE}>Anak Pengganti</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}>
            <div>
              <FLabel>Type ganti *</FLabel>
              <Sel
                value={tipeGanti}
                onChange={e => handleTipeChange(e.target.value as TipeGanti)}
              >
                <option value="pemasangan_baru">Pemasangan Baru (CAJ)</option>
                <option value="anak_existing">Anak Existing (nonaktif)</option>
              </Sel>
            </div>
            <div style={penggantiInvalid ? { borderRadius: 10, ...INVALID, padding: 2 } : undefined}>
              <FLabel>Nama Anak ganti *</FLabel>
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
          </div>
          <div style={{ marginTop: 12 }}>
            <FLabel>Keterangan</FLabel>
            <Textarea
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              rows={2}
            />
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

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center',
          // Kept interactive so the disabled state stops the user, not a dead zone.
          pointerEvents: 'auto',
        }}>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={14} className="ajis-spin" />
                Menyimpan...
              </>
            ) : 'Save'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
