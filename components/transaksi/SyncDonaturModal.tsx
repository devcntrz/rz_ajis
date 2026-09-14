'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import type { DonaturCandidate } from '@/types/transaksi';

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

const T = { gray: '#7A6055', grayLt: '#F2EAE3' };

/** Get Donatur (legacy `get_donatur_api.php` + `m=c_didget`). */
export function SyncDonaturModal({ onClose, onSuccess }: Props) {
  const [idDonatur, setIdDonatur] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<DonaturCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const search = async () => {
    setSearching(true);
    try {
      const qs = new URLSearchParams();
      if (idDonatur) qs.set('id_donatur', idDonatur);
      const res = await fetch(`/api/anakjuara/transaksi/sync/donatur?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal mencari donatur.'); return; }
      setResults(json.data ?? []);
      setSelected(new Set());
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSearching(false);
    }
  };

  const toggle = (did: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(did)) next.delete(did); else next.add(did);
      return next;
    });
  };

  const submit = async () => {
    const rows = results.filter(r => selected.has(r.did));
    if (rows.length === 0) { toast.error('Pilih minimal satu donatur.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/transaksi/sync/donatur', {
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
    <Modal title="Get Donatur" onClose={onClose} maxWidth={760}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ fontSize: 12, color: T.gray }}>
          Cari data donatur dari API RZ Partner berdasarkan ID donatur.
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px' }}>
            <FLabel>ID Donatur</FLabel>
            <Input value={idDonatur} onChange={e => setIdDonatur(e.target.value)} placeholder="Opsional" />
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
                  <th style={{ padding: 8 }}>DID</th>
                  <th style={{ padding: 8 }}>Nama</th>
                  <th style={{ padding: 8 }}>HP</th>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>Aktif</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.did} style={{ borderBottom: `1px solid ${T.grayLt}` }}>
                    <td style={{ padding: 8 }}>
                      <input
                        type="checkbox"
                        checked={selected.has(r.did)}
                        onChange={() => toggle(r.did)}
                      />
                    </td>
                    <td style={{ padding: 8 }}>{r.did}</td>
                    <td style={{ padding: 8 }}>{r.nama_lengkap}</td>
                    <td style={{ padding: 8 }}>{r.hp}</td>
                    <td style={{ padding: 8 }}>{r.email}</td>
                    <td style={{ padding: 8 }}>{r.aktif}</td>
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
