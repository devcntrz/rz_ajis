'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { fmtRp } from '@/lib/utils';
import { useKandidat, usePenyaluranLookup } from '@/hooks/usePenyaluran';

const T = { primary: '#BF4E02', gray: '#7A6055', primaryPale: '#FBF0E8', green: '#1A7A45' };

interface Props { onClose: () => void; onSuccess: () => void; }

export function NewBulkWizard({ onClose, onSuccess }: Props) {
  const { kantor, wilayah } = usePenyaluranLookup();
  const [kantorId, setKantorId] = useState('');
  const [wilayahId, setWilayahId] = useState('');
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [previewed, setPreviewed] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredWilayah = kantorId ? wilayah.filter(w => w.kantor_id === kantorId) : wilayah;

  const kandidat = useKandidat(
    { kantorId, wilayahId, tahun: Number(tahun), bulan: Number(bulan), limit: 5000 },
    { enabled: previewed },
  );

  const totalNominal = kandidat.rows.reduce((s, r) => s + Number(r.harga_program || 0), 0);

  const preview = () => {
    if (!wilayahId) { toast.error('Pilih wilayah terlebih dahulu.'); return; }
    setPreviewed(true);
  };

  const commit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/penyaluran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kantorId, wilayahId, bulan: Number(bulan), tahun: Number(tahun) }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal membuat batch.'); return; }
      toast.success(json.message || 'Batch penyaluran dibuat.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="New Penyaluran — Bulk (per Wilayah)" onClose={onClose} maxWidth={700}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          <div>
            <FLabel>Kantor</FLabel>
            <Sel value={kantorId} onChange={e => { setKantorId(e.target.value); setWilayahId(''); setPreviewed(false); }}>
              <option value="">Semua</option>
              {kantor.map(k => <option key={k.oid} value={k.oid}>{k.kantor}</option>)}
            </Sel>
          </div>
          <div>
            <FLabel>Wilayah</FLabel>
            <Sel value={wilayahId} onChange={e => { setWilayahId(e.target.value); setPreviewed(false); }}>
              <option value="">Pilih wilayah</option>
              {filteredWilayah.map(w => (
                <option key={w.id_wilayah_pembinaan} value={String(w.id_wilayah_pembinaan)}>{w.nama_wilayah}</option>
              ))}
            </Sel>
          </div>
          <div>
            <FLabel>Bulan</FLabel>
            <Sel value={bulan} onChange={e => { setBulan(e.target.value); setPreviewed(false); }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
                <option key={b} value={String(b)}>{b}</option>
              ))}
            </Sel>
          </div>
          <div>
            <FLabel>Tahun</FLabel>
            <Sel value={tahun} onChange={e => { setTahun(e.target.value); setPreviewed(false); }}>
              {[0, 1, 2].map(d => {
                const y = new Date().getFullYear() - d;
                return <option key={y} value={String(y)}>{y}</option>;
              })}
            </Sel>
          </div>
        </div>

        <Btn variant="outline" onClick={preview} disabled={kandidat.loading}>
          {kandidat.loading ? 'Memuat kandidat…' : 'Preview Kandidat'}
        </Btn>

        {previewed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              background: T.primaryPale, borderRadius: 10, padding: 12, fontSize: 13,
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            }}>
              <span><strong>{kandidat.rows.length}</strong> anak layak salur</span>
              <span>Total: <strong style={{ color: T.green }}>{fmtRp(totalNominal)}</strong></span>
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #F2EAE3', borderRadius: 8 }}>
              {kandidat.rows.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: T.gray, fontSize: 13 }}>
                  Tidak ada anak layak salur untuk kriteria ini.
                </div>
              )}
              {kandidat.rows.map(k => (
                <div key={k.id_anak} style={{ padding: '8px 12px', borderBottom: '1px solid #F2EAE3', fontSize: 12.5 }}>
                  <strong>{k.nama_anak}</strong> ({k.id_anak}) — {k.program_donasi} — {fmtRp(k.harga_program)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn
            variant="primary"
            onClick={commit}
            disabled={!previewed || kandidat.rows.length === 0 || saving}
          >
            {saving ? 'Menyimpan…' : `Buat Batch (${kandidat.rows.length} anak)`}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
