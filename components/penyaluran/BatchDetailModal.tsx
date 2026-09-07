'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Lock, Plus, Printer, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { RowActions } from '@/components/ui/RowActions';
import { fmtRp } from '@/lib/utils';
import { useBatchDetail } from '@/hooks/usePenyaluran';
import { NewSingleRowForm } from '@/components/penyaluran/NewSingleRowForm';
import { TeknisPenyaluranModal } from '@/components/penyaluran/TeknisPenyaluranModal';
import { PascaPenyaluranModal } from '@/components/penyaluran/PascaPenyaluranModal';
import { EditRowModal } from '@/components/penyaluran/EditRowModal';
import type { PenyaluranBatch, PenyaluranRow } from '@/types/penyaluran';

const T = { gray: '#7A6055', grayLt: '#F2EAE3', green: '#1A7A45', red: '#B02020' };

interface Props {
  batch:          PenyaluranBatch;
  onClose:        () => void;
  onBatchChanged: () => void;
}

export function BatchDetailModal({ batch, onClose, onBatchChanged }: Props) {
  const detail = useBatchDetail(batch.id_penyaluran);
  const [showNewSingle, setShowNewSingle] = useState(false);
  const [showTeknis, setShowTeknis] = useState(false);
  const [showPasca, setShowPasca] = useState(false);
  const [editRow, setEditRow] = useState<PenyaluranRow | null>(null);
  const locked = batch.status_akhir === 'y';

  const refresh = () => { detail.mutate(); onBatchChanged(); };

  const handleDelete = async (row: PenyaluranRow) => {
    if (!window.confirm(`Hapus baris ${row.nama_anak} dari batch ini?`)) return;
    const res = await fetch(
      `/api/anakjuara/penyaluran/${encodeURIComponent(batch.id_penyaluran)}/rows/${row.id_row}`,
      { method: 'DELETE' },
    );
    const json = await res.json();
    if (!res.ok) { toast.error(json.error || 'Gagal menghapus baris.'); return; }
    toast.success(json.message || 'Baris dihapus.');
    refresh();
  };

  return (
    <>
      <Modal title={`Batch ${batch.id_penyaluran} — ${batch.nama_wilayah}`} onClose={onClose} maxWidth={880}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn size="sm" onClick={() => setShowNewSingle(true)} disabled={locked}>
              <Plus size={14} /> New Single
            </Btn>
            <Btn size="sm" onClick={() => setShowTeknis(true)} disabled={locked}>
              <Wrench size={14} /> Update Tgl-SDM
            </Btn>
            <Btn size="sm" variant="danger" onClick={() => setShowPasca(true)} disabled={locked}>
              <Lock size={14} /> {locked ? 'Sudah Dikunci' : 'Pasca Penyaluran'}
            </Btn>
            <a href={`/api/anakjuara/penyaluran/${encodeURIComponent(batch.id_penyaluran)}/print`} target="_blank" rel="noreferrer">
              <Btn size="sm"><Printer size={14} /> Print Penyaluran</Btn>
            </a>
            <a href={`/api/anakjuara/penyaluran/${encodeURIComponent(batch.id_penyaluran)}/export`}>
              <Btn size="sm"><Download size={14} /> Export Detail</Btn>
            </a>
          </div>

          <div style={{ border: `1px solid ${T.grayLt}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#FBF0E8', textAlign: 'left' }}>
                    <th style={{ padding: 8 }}>Anak</th>
                    <th style={{ padding: 8 }}>Program</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Nominal</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>HPP</th>
                    <th style={{ padding: 8 }}>Via</th>
                    <th style={{ padding: 8, width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {detail.loading && (
                    <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: T.gray }}>Memuat…</td></tr>
                  )}
                  {!detail.loading && detail.rows.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: T.gray }}>Belum ada baris.</td></tr>
                  )}
                  {detail.rows.map(r => (
                    <tr key={r.id_row} style={{ borderTop: `1px solid ${T.grayLt}` }}>
                      <td style={{ padding: 8 }}>
                        <strong>{r.nama_anak}</strong>
                        <div style={{ fontSize: 11, color: T.gray }}>{r.id_anak} · {r.jenjang_pendidikan}</div>
                      </td>
                      <td style={{ padding: 8 }}>{r.program_donasi || '-'}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 700, color: T.green }}>{fmtRp(r.nominal_penyaluran)}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{fmtRp(r.nominal_hpp)}</td>
                      <td style={{ padding: 8 }}>{r.via_input}</td>
                      <td style={{ padding: 8 }}>
                        <RowActions
                          label={`Aksi ${r.nama_anak}`}
                          items={[
                            { label: 'Edit baris', onClick: () => setEditRow(r), disabled: locked },
                            { label: 'Hapus baris', onClick: () => handleDelete(r), danger: true, disabled: locked },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {showNewSingle && (
        <NewSingleRowForm
          batch={batch}
          onClose={() => setShowNewSingle(false)}
          onSuccess={() => { setShowNewSingle(false); refresh(); }}
        />
      )}
      {showTeknis && (
        <TeknisPenyaluranModal
          batch={batch}
          onClose={() => setShowTeknis(false)}
          onSuccess={() => { setShowTeknis(false); refresh(); onClose(); }}
        />
      )}
      {showPasca && (
        <PascaPenyaluranModal
          batch={batch}
          onClose={() => setShowPasca(false)}
          onSuccess={() => { setShowPasca(false); refresh(); }}
        />
      )}
      {editRow && (
        <EditRowModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSuccess={() => { setEditRow(null); refresh(); }}
        />
      )}
    </>
  );
}
