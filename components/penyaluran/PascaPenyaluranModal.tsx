'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import type { PenyaluranBatch } from '@/types/penyaluran';

const T = { gold: '#B87800', goldPale: '#FDF4DC', gray: '#7A6055' };

interface Props { batch: PenyaluranBatch; onClose: () => void; onSuccess: () => void; }

export function PascaPenyaluranModal({ batch, onClose, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/anakjuara/penyaluran/${encodeURIComponent(batch.id_penyaluran)}/pasca`,
        { method: 'POST' },
      );
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal mengunci batch.'); return; }
      toast.success(json.message || 'Batch dikunci.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Pasca Penyaluran" onClose={onClose} maxWidth={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{
          display: 'flex', gap: 10, background: T.goldPale, color: T.gold,
          borderRadius: 10, padding: 12, fontSize: 13,
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            Batch <strong>{batch.id_penyaluran}</strong> akan dikunci (status akhir). Tindakan ini
            <strong> tidak dapat dibatalkan</strong> — baris di dalamnya tidak bisa diedit/dihapus
            lagi setelah dikunci.
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="danger" onClick={confirm} disabled={saving}>
            {saving ? 'Memproses…' : 'Kunci Batch'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
