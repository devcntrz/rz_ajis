'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { useSdmSearch } from '@/hooks/usePenyaluran';
import type { PenyaluranBatch } from '@/types/penyaluran';

const T = { primaryPale: '#FBF0E8', primary: '#BF4E02', gray: '#7A6055', grayLt: '#F2EAE3' };

interface Props { batch: PenyaluranBatch; onClose: () => void; onSuccess: () => void; }

export function TeknisPenyaluranModal({ batch, onClose, onSuccess }: Props) {
  const [idPenyaluranBaru, setIdPenyaluranBaru] = useState(batch.id_penyaluran);
  const [tgl, setTgl] = useState(batch.tgl_penyaluran?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [sdmQ, setSdmQ] = useState(batch.nama_sdm ?? '');
  const [idSdm, setIdSdm] = useState(batch.id_sdm ?? '');
  const [saving, setSaving] = useState(false);

  const sdmResults = useSdmSearch(idSdm ? '' : sdmQ);

  const save = async () => {
    if (!idSdm) { toast.error('Pilih petugas SDM.'); return; }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/anakjuara/penyaluran/${encodeURIComponent(batch.id_penyaluran)}/teknis`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idPenyaluranBaru: idPenyaluranBaru !== batch.id_penyaluran ? idPenyaluranBaru : undefined,
            tglPenyaluran: tgl,
            idSdm,
          }),
        },
      );
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
    <Modal title="Update Tgl-SDM (Teknis Penyaluran)" onClose={onClose} maxWidth={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <FLabel>ID Penyaluran</FLabel>
          <Input value={idPenyaluranBaru} onChange={e => setIdPenyaluranBaru(e.target.value)} />
        </div>
        <div>
          <FLabel>Tgl Penyaluran</FLabel>
          <Input type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
        </div>
        <div style={{ position: 'relative' }}>
          <FLabel>Petugas SDM</FLabel>
          <Input
            value={sdmQ}
            onChange={e => { setSdmQ(e.target.value); setIdSdm(''); }}
            placeholder="Ketik nama SDM…"
          />
          {!idSdm && sdmQ.trim().length >= 2 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: '#FFFFFF', border: `1.5px solid ${T.grayLt}`, borderRadius: 8,
              maxHeight: 180, overflowY: 'auto', marginTop: 4,
            }}>
              {sdmResults.loading && <div style={{ padding: 8, fontSize: 12 }}>Mencari…</div>}
              {sdmResults.rows.map(s => (
                <div
                  key={s.id_sdm}
                  onClick={() => { setIdSdm(s.id_sdm); setSdmQ(s.nama_lengkap); }}
                  style={{ padding: 8, fontSize: 12.5, cursor: 'pointer', borderBottom: `1px solid ${T.grayLt}` }}
                >
                  {s.nama_lengkap}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Btn>
        </div>
      </div>
    </Modal>
  );
}
