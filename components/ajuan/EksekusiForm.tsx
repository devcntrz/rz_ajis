'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea } from '@/components/ui/Input';
import type { AjuanGantiAnak, DonasiPindahRow } from '@/types/ajuan';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface EksekusiFormProps {
  row: AjuanGantiAnak;
  onClose: () => void;
  onSuccess: () => void;
}

export function EksekusiForm({ row, onClose, onSuccess }: EksekusiFormProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [keterangan, setKeterangan] = useState(row.alasan_pergantian || '');
  const [saldoAkhirGanti, setSaldoAkhirGanti] = useState(String(row.pindah_saldo || 0));
  const [saldoAwalGanjil, setSaldoAwalGanjil] = useState('0');
  const [saldoAkhirGanjil, setSaldoAkhirGanjil] = useState('0');
  const [saldoAwalGenap, setSaldoAwalGenap] = useState('0');
  const [saldoAkhirGenap, setSaldoAkhirGenap] = useState('0');
  const [selectedDonasi, setSelectedDonasi] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: donasiRes } = useSWR<{ data: DonasiPindahRow[] }>(
    confirmed ? `/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/donasi-pindah` : null,
    fetcher,
  );
  const donasiList = donasiRes?.data ?? [];

  useEffect(() => {
    const ok = window.confirm('Sudah Update Saldo Akhir ?');
    if (!ok) {
      onClose();
      return;
    }
    setConfirmed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- confirm once on mount
  }, []);

  const toggleDonasi = (id: number) => {
    setSelectedDonasi(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!keterangan.trim()) {
      setError('Keterangan pemberhentian wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/eksekusi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keterangan_pemberhentian: keterangan.trim(),
          saldo_akhir_ganti: Number(saldoAkhirGanti) || 0,
          saldo_awal_ganjil: Number(saldoAwalGanjil) || 0,
          saldo_akhir_ganjil: Number(saldoAkhirGanjil) || 0,
          saldo_awal_genap: Number(saldoAwalGenap) || 0,
          saldo_akhir_genap: Number(saldoAkhirGenap) || 0,
          id_input_donasi: selectedDonasi,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Gagal mengeksekusi.');
        return;
      }
      onSuccess();
    } catch {
      setError('Gagal mengeksekusi.');
    } finally {
      setSaving(false);
    }
  };

  if (!confirmed) return null;

  return (
    <Modal title="Eksekusi Pergantian Anak" onClose={onClose} maxWidth={720}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: '#1A0A00', background: '#FBF0E8', borderRadius: 10, padding: 12 }}>
          <div><strong>{row.nama_anak_asal}</strong> → <strong>{row.nama_anak_pengganti}</strong></div>
          <div style={{ fontSize: 12, color: '#7A6055', marginTop: 4 }}>
            Donatur {row.nama_donatur} · {row.program_donasi}
          </div>
        </div>

        <div>
          <FLabel>Keterangan Pemberhentian *</FLabel>
          <Textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={2} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <div>
            <FLabel>Saldo Akhir Ganti</FLabel>
            <Input type="number" value={saldoAkhirGanti} onChange={e => setSaldoAkhirGanti(e.target.value)} />
          </div>
          <div>
            <FLabel>Saldo Awal Ganjil (lama)</FLabel>
            <Input type="number" value={saldoAwalGanjil} onChange={e => setSaldoAwalGanjil(e.target.value)} />
          </div>
          <div>
            <FLabel>Saldo Akhir Ganjil (lama)</FLabel>
            <Input type="number" value={saldoAkhirGanjil} onChange={e => setSaldoAkhirGanjil(e.target.value)} />
          </div>
          <div>
            <FLabel>Saldo Awal Genap (lama)</FLabel>
            <Input type="number" value={saldoAwalGenap} onChange={e => setSaldoAwalGenap(e.target.value)} />
          </div>
          <div>
            <FLabel>Saldo Akhir Genap (lama)</FLabel>
            <Input type="number" value={saldoAkhirGenap} onChange={e => setSaldoAkhirGenap(e.target.value)} />
          </div>
        </div>

        <div>
          <FLabel>Donasi dipindahkan (opsional)</FLabel>
          {donasiList.length === 0 ? (
            <div style={{ fontSize: 12, color: '#7A6055' }}>Tidak ada donasi / sedang memuat...</div>
          ) : (
            <div style={{
              maxHeight: 180, overflow: 'auto', border: '1px solid #F2EAE3',
              borderRadius: 10, padding: 8,
            }}>
              {donasiList.map(d => (
                <label
                  key={d.id_input_donasi}
                  style={{
                    display: 'flex', gap: 8, alignItems: 'center',
                    fontSize: 12, padding: '6px 4px', cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDonasi.includes(d.id_input_donasi)}
                    onChange={() => toggleDonasi(d.id_input_donasi)}
                  />
                  <span>
                    #{d.id_input_donasi} · {d.bulan}/{d.tahun} ·{' '}
                    {Number(d.nominal_donasi || 0).toLocaleString('id-ID')}
                  </span>
                </label>
              ))}
            </div>
          )}
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
            {saving ? 'Memproses...' : 'Simpan Eksekusi'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
