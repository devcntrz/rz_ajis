'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input, Sel, Textarea } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { parseBulanSalur } from '@/lib/transaksi/rules';
import type { Transaksi } from '@/types/transaksi';

const T = {
  gray: '#7A6055', charcoal: '#1A0A00',
  gold: '#B87800', goldPale: '#FDF4DC',
};

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface Props {
  /** Single-row mode. */
  row?:       Transaksi | null;
  /** Bulk mode: the `id_review` keys checked on the Review tab. */
  idReview?:  string[];
  onClose:    () => void;
  onSuccess:  () => void;
}

/**
 * Not / Approve Salur — sets the salur period.
 *
 * In single-row mode this wipes the transaction's existing splits, which legacy did
 * silently. The warning below is shown whenever there is actually something to lose.
 */
export function ApproveSalurModal({ row, idReview, onClose, onSuccess }: Props) {
  const bulk = !row && !!idReview?.length;

  const [bulan, setBulan] = useState(
    String(parseBulanSalur(row?.bulan_salur) ?? new Date().getMonth() + 1),
  );
  const [tahun, setTahun] = useState(
    String(row?.tahun_salur || new Date().getFullYear()),
  );
  const [approve, setApprove] = useState<'y' | 'n'>(row?.approve_salur === 'n' ? 'n' : 'y');
  const [cicilan, setCicilan] = useState<'y' | 'n'>(row?.cicilan === 'y' ? 'y' : 'n');
  const [ket, setKet] = useState(row?.ket_approve_salur ?? '');
  const [saving, setSaving] = useState(false);

  const willWipeEntries = !bulk && row?.status_pasang === 'y';

  const submit = async () => {
    if (!/^\d{4}$/.test(tahun)) {
      toast.error('Tahun salur harus 4 digit.');
      return;
    }
    if (willWipeEntries && !window.confirm(
      `Transaksi ini sudah dientry (${row!.total_input_donasi.toLocaleString('id-ID')}).\n\n` +
      'Menyimpan Approve Salur akan MENGHAPUS seluruh entry cashflow-nya dan ' +
      'Anda harus melakukan Entry Cashflow ulang.\n\nLanjutkan?',
    )) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bulan_salur:       Number(bulan),
        tahun_salur:       tahun,
        approve_salur:     approve,
        ket_approve_salur: ket,
        cicilan,
      };
      const url = bulk
        ? '/api/anakjuara/transaksi/review/approve'
        : `/api/anakjuara/transaksi/${encodeURIComponent(row!.transid)}/${row!.detailid}/approve-salur`;

      const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(bulk ? { ...payload, id_review: idReview } : payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal menyimpan approve salur.');
        return;
      }
      toast.success(json.message || 'Approve salur tersimpan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={bulk ? `Approve Salur — ${idReview!.length} transaksi terpilih` : 'Not / Approve Salur'}
      onClose={onClose}
      maxWidth={540}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {!bulk && (
          <div style={{ fontSize: 12, color: T.gray }}>
            {row!.transid} · {row!.detailid} — {row!.nama_donatur || row!.did}
          </div>
        )}

        {willWipeEntries && (
          <div style={{
            background: T.goldPale, color: T.gold, borderRadius: 10, padding: '11px 13px',
            fontSize: 12.5, fontWeight: 600, display: 'flex', gap: 9, alignItems: 'flex-start',
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Transaksi ini sudah dientry. Menyimpan akan menghapus seluruh entry cashflow-nya,
              karena mengganti bulan salur membuat entry lama tidak lagi berlaku.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FLabel>Bulan salur</FLabel>
            <Sel value={bulan} onChange={e => setBulan(e.target.value)}>
              {BULAN.map((b, i) => <option key={b} value={String(i + 1)}>{b}</option>)}
            </Sel>
          </div>
          <div>
            <FLabel>Tahun salur</FLabel>
            <Input type="number" value={tahun} onChange={e => setTahun(e.target.value)} />
          </div>
          <div>
            <FLabel>Approve salur</FLabel>
            <Sel value={approve} onChange={e => setApprove(e.target.value as 'y' | 'n')}>
              <option value="y">Ya — disetujui</option>
              <option value="n">Tidak</option>
            </Sel>
          </div>
          <div>
            <FLabel>Cicilan</FLabel>
            <Sel value={cicilan} onChange={e => setCicilan(e.target.value as 'y' | 'n')}>
              <option value="n">Bukan cicilan</option>
              <option value="y">Cicilan</option>
            </Sel>
          </div>
        </div>

        <div>
          <FLabel>Keterangan</FLabel>
          <Textarea value={ket} onChange={e => setKet(e.target.value)} rows={3} />
        </div>

        <div style={{ fontSize: 11.5, color: T.gray }}>
          Periode akan tercatat sebagai{' '}
          <strong style={{ color: T.charcoal }}>
            {Number(bulan) <= 6 ? 'ganjil' : 'genap'}
          </strong>{' '}
          (bulan 1–6 ganjil, 7–12 genap).
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={submit} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
