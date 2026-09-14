'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { fmtRp } from '@/lib/utils';
import { useKandidat } from '@/hooks/usePenyaluran';
import type { PenyaluranBatch } from '@/types/penyaluran';

const T = { primaryPale: '#FBF0E8', primary: '#BF4E02', gray: '#7A6055', grayLt: '#F2EAE3' };

interface Props {
  batch:     PenyaluranBatch;
  onClose:   () => void;
  onSuccess: () => void;
}

export function NewSingleRowForm({ batch, onClose, onSuccess }: Props) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const kandidat = useKandidat({
    wilayahId: batch.id_wilayah_pembinaan,
    kantorId:  batch.id_kantor,
    tahun:     Number(batch.tahun),
    bulan:     Number(batch.bulan),
    q,
    limit: 20,
  });

  const save = async () => {
    if (!selected) { toast.error('Pilih anak terlebih dahulu.'); return; }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/anakjuara/penyaluran/${encodeURIComponent(batch.id_penyaluran)}/rows`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idAnak: selected }),
        },
      );
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menambah anak.'); return; }
      toast.success(json.message || 'Anak ditambahkan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`New Single — Batch ${batch.id_penyaluran}`} onClose={onClose} maxWidth={640}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <FLabel>Cari Anak</FLabel>
          <Input value={q} onChange={e => { setQ(e.target.value); setSelected(null); }} placeholder="Nama atau ID anak…" />
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', overflowX: 'auto', border: `1.5px solid ${T.grayLt}`, borderRadius: 8 }}>
          {kandidat.loading && <div style={{ padding: 12, fontSize: 12, color: T.gray }}>Mencari…</div>}
          {kandidat.error && (
            <div style={{ padding: 12, fontSize: 12, color: '#B02020' }}>
              {kandidat.error.message || 'Gagal memuat kandidat.'}
            </div>
          )}
          {!kandidat.loading && !kandidat.error && kandidat.rows.length === 0 && (
            <div style={{ padding: 12, fontSize: 12, color: T.gray }}>Tidak ada kandidat.</div>
          )}
          {!kandidat.loading && !kandidat.error && kandidat.rows.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: T.grayLt, textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>ID Anak</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Nama Anak</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>Jenjang</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600 }}>Program</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Harga Program</th>
                </tr>
              </thead>
              <tbody>
                {kandidat.rows.map(k => (
                  <tr
                    key={k.id_anak}
                    onClick={() => setSelected(k.id_anak)}
                    style={{
                      cursor: 'pointer',
                      borderTop: `1px solid ${T.grayLt}`,
                      background: selected === k.id_anak ? T.primaryPale : undefined,
                      boxShadow: selected === k.id_anak ? `inset 3px 0 0 ${T.primary}` : undefined,
                    }}
                  >
                    <td style={{ padding: '7px 10px', whiteSpace: 'nowrap', color: T.gray }}>{k.id_anak}</td>
                    <td style={{ padding: '7px 10px', fontWeight: 600 }}>{k.nama_anak}</td>
                    <td style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>{k.jenjang_pendidikan}{k.kelas ? ` ${k.kelas}` : ''}</td>
                    <td style={{ padding: '7px 10px' }}>{k.program_donasi}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtRp(k.harga_program)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={!selected || saving}>
            {saving ? 'Menyimpan…' : 'Tambahkan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
