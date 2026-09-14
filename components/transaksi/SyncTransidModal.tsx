'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { fmtRp } from '@/lib/utils';
import type { TransidCandidate } from '@/types/transaksi';

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

const T = { primary: '#BF4E02', charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3' };

/**
 * Get Transid / Get Transid by tgl (legacy: two buttons, one API — `transaksiZ`
 * already accepts a date range alongside `id_transaksi`, so this single modal covers
 * both search modes instead of duplicating a second dialog for the date-range variant).
 */
export function SyncTransidModal({ onClose, onSuccess }: Props) {
  const [idTransaksi, setIdTransaksi] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<TransidCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rowKey = (r: TransidCandidate) => `${r.transid}-${r.detailid}`;

  const search = async () => {
    setSearching(true);
    try {
      const qs = new URLSearchParams();
      if (idTransaksi) qs.set('id_transaksi', idTransaksi);
      if (startDate) qs.set('start_date', startDate);
      if (endDate) qs.set('end_date', endDate);
      const res = await fetch(`/api/anakjuara/transaksi/sync/transid?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal mencari transaksi.'); return; }
      setResults(json.data ?? []);
      setSelected(new Set());
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSearching(false);
    }
  };

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const submit = async () => {
    const rows = results.filter(r => selected.has(rowKey(r)));
    if (rows.length === 0) { toast.error('Pilih minimal satu transaksi.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/transaksi/sync/transid', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rows }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menyimpan.'); return; }
      toast.success(json.message || 'Tersimpan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Get Transid" onClose={onClose} maxWidth={860}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ fontSize: 12, color: T.gray }}>
          Cari transaksi dari API RZ Partner berdasarkan ID transaksi, atau berdasarkan rentang
          tanggal (menggantikan &ldquo;Get Transid by tgl&rdquo;).
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <FLabel>ID Transaksi</FLabel>
            <Input value={idTransaksi} onChange={e => setIdTransaksi(e.target.value)} placeholder="Opsional" />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <FLabel>Tgl Awal</FLabel>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <FLabel>Tgl Akhir</FLabel>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Btn variant="primary" onClick={search} disabled={searching}>
            {searching ? 'Mencari…' : 'Cari'}
          </Btn>
        </div>

        {results.length > 0 && (
          <div style={{ maxHeight: 360, overflow: 'auto', border: `1px solid ${T.grayLt}`, borderRadius: 10 }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#FFFFFF' }}>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${T.grayLt}` }}>
                  <th style={{ padding: 8 }} />
                  <th style={{ padding: 8 }}>Transid</th>
                  <th style={{ padding: 8 }}>Donatur</th>
                  <th style={{ padding: 8 }}>Program</th>
                  <th style={{ padding: 8 }}>Nominal</th>
                  <th style={{ padding: 8 }}>Tgl Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={rowKey(r)} style={{ borderBottom: `1px solid ${T.grayLt}` }}>
                    <td style={{ padding: 8 }}>
                      <input
                        type="checkbox"
                        checked={selected.has(rowKey(r))}
                        onChange={() => toggle(rowKey(r))}
                      />
                    </td>
                    <td style={{ padding: 8 }}>{r.transid}</td>
                    <td style={{ padding: 8 }}>{r.nama_donatur || r.did}</td>
                    <td style={{ padding: 8 }}>{r.nama_program}</td>
                    <td style={{ padding: 8 }}>{fmtRp(r.perkiraan_rp)}</td>
                    <td style={{ padding: 8 }}>{r.tgl_transaksi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={submit} disabled={saving || selected.size === 0}>
            {saving ? 'Menyimpan…' : `Simpan (${selected.size} dipilih)`}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
