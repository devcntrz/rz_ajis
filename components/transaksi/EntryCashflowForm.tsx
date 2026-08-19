'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { useAnakKandidat, useTransaksiEntries } from '@/hooks/useTransaksi';
import { fmtRp, fmtTgl } from '@/lib/utils';
import type { EntryRow, Transaksi } from '@/types/transaksi';

const T = {
  primary: '#BF4E02', primaryDk: '#8F3A01', primarySoft: '#F0C4A0', primaryPale: '#FBF0E8',
  charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3', white: '#FFFFFF',
  green: '#1A7A45', greenPale: '#E5F5ED', red: '#B02020', redPale: '#FDEAEA',
};

/** A row being edited, plus the child's name for display only. */
interface DraftRow extends EntryRow {
  nama_anak: string;
}

interface Props {
  row:       Transaksi;
  mode:      'create' | 'update';
  onClose:   () => void;
  onSuccess: () => void;
}

export function EntryCashflowForm({ row, mode, onClose, onSuccess }: Props) {
  const [qty, setQty] = useState(1);
  /** null = untouched, still mirroring the server. */
  const [edits, setEdits] = useState<DraftRow[] | null>(null);
  const [saving, setSaving] = useState(false);

  const candidates = useAnakKandidat(row.transid, row.detailid, qty, {
    enabled: mode === 'create',
  });
  const entries = useTransaksiEntries(row.transid, row.detailid, {
    enabled: mode === 'update',
  });

  /**
   * The grid is derived from whichever source this mode uses, not copied into state by
   * an effect. Local edits simply shadow it, so a slow fetch can never land after the
   * operator has started typing and overwrite their work.
   */
  const seed: DraftRow[] = useMemo(() => {
    if (mode === 'create') {
      return candidates.rows.map(c => ({
        id_anak:              c.id_anak,
        nama_anak:            c.nama_anak,
        id_pemasangan_baru:   c.id_pemasangan_baru,
        id_program:           String(c.id_program ?? ''),
        program_donasi:       c.program_donasi,
        kantor_id:            c.kantor_id,
        id_wilayah_pembinaan: c.id_wilayah_pembinaan,
        pilihan_donasi:       Number(c.pilihan_donasi),
        qty:                  Number(c.qty),
        nominal_donasi:       Number(c.nominal_donasi),
      }));
    }
    return entries.rows.map(e => ({
      id_anak:              e.id_anak,
      nama_anak:            e.nama_anak,
      id_pemasangan_baru:   e.id_pemasangan_baru,
      id_program:           String(e.id_program ?? ''),
      program_donasi:       e.program_donasi,
      kantor_id:            e.kantor_id,
      id_wilayah_pembinaan: e.id_wilayah_pembinaan,
      pilihan_donasi:       Number(e.pilihan_donasi),
      qty:                  Number(e.qty),
      nominal_donasi:       Number(e.nominal_donasi),
    }));
  }, [mode, candidates.rows, entries.rows]);

  const draft = edits ?? seed;
  const perkiraan = Math.round(Number(row.perkiraan_rp));
  const total = draft.reduce((s, r) => s + Number(r.nominal_donasi || 0), 0);
  const selisih = perkiraan - Math.round(total);
  const balanced = selisih === 0 && draft.length > 0;

  const loading = mode === 'create' ? candidates.loading : entries.loading;
  const sourceError = mode === 'create' ? candidates.error : entries.error;

  const patch = (idAnak: string, next: Partial<DraftRow>) => {
    setEdits(draft.map(r => {
      if (r.id_anak !== idAnak) return r;
      const merged = { ...r, ...next };
      // qty and unit price are the inputs; the line total always follows from them.
      if (next.qty !== undefined || next.pilihan_donasi !== undefined) {
        merged.nominal_donasi = Number(merged.pilihan_donasi) * Number(merged.qty);
      }
      return merged;
    }));
  };

  const remove = (idAnak: string) => setEdits(draft.filter(r => r.id_anak !== idAnak));

  /** Discard local edits and fall back to the server data. */
  const reload = () => setEdits(null);

  /** Spread the transaction amount evenly, giving the remainder to the first row. */
  const distributeEvenly = () => {
    if (draft.length === 0) return;
    const base = Math.floor(perkiraan / draft.length);
    const remainder = perkiraan - base * draft.length;
    setEdits(draft.map((r, i) => {
      const nominal = i === 0 ? base + remainder : base;
      return { ...r, qty: 1, pilihan_donasi: nominal, nominal_donasi: nominal };
    }));
  };

  const save = async () => {
    if (!balanced) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/anakjuara/transaksi/${encodeURIComponent(row.transid)}/${row.detailid}/entries`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          // Body, not query string: legacy sent this as &data=<JSON> in the URL, which
          // truncated for donors with hundreds of children.
          // `nama_anak` is display-only; the server reads names from the master.
          body: JSON.stringify({
            mode,
            rows: draft.map(r => ({
              id_anak:              r.id_anak,
              id_pemasangan_baru:   r.id_pemasangan_baru,
              id_program:           r.id_program,
              program_donasi:       r.program_donasi,
              kantor_id:            r.kantor_id,
              id_wilayah_pembinaan: r.id_wilayah_pembinaan,
              pilihan_donasi:       r.pilihan_donasi,
              qty:                  r.qty,
              nominal_donasi:       r.nominal_donasi,
            })),
          }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal menyimpan cashflow.');
        return;
      }
      toast.success(json.message || 'Cashflow tersimpan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${mode === 'create' ? 'Entry' : 'Update'} Cashflow — ${row.nama_donatur || row.did}`}
      onClose={onClose}
      maxWidth={1000}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Transaction header, read-only */}
        <div style={{
          background: T.primaryPale, borderRadius: 12, padding: 12,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10,
        }}>
          <Field label="Trans ID" value={`${row.transid} · ${row.detailid}`} />
          <Field label="Program" value={row.nama_program || '-'} />
          <Field label="Nominal" value={fmtRp(row.perkiraan_rp)} strong />
          <Field label="Salur" value={`${row.bulan_salur || '-'} / ${row.tahun_salur || '-'}`} />
          <Field label="Tgl transaksi" value={fmtTgl(row.tgl_transaksi)} />
          <Field label="Jml PM" value={row.jml_mustahik || '-'} />
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {mode === 'create' && (
            <div style={{ width: 130 }}>
              <FLabel>Qty per anak</FLabel>
              <Input
                type="number"
                value={qty}
                onChange={e => {
                  const n = Number(e.target.value);
                  setQty(Number.isInteger(n) && n > 0 ? n : 1);
                  // Changing qty re-derives every line from the server price.
                  setEdits(null);
                }}
              />
            </div>
          )}
          <Btn variant="outline" size="sm" onClick={distributeEvenly} disabled={draft.length === 0}>
            Bagi rata sesuai nominal
          </Btn>
          <Btn variant="ghost" size="sm" onClick={reload}>
            <RotateCcw size={14} /> Muat ulang
          </Btn>
        </div>

        {/* Balance indicator */}
        <div style={{
          display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center',
          background: balanced ? T.greenPale : T.redPale,
          color: balanced ? T.green : T.red,
          borderRadius: 12, padding: '11px 14px', fontSize: 13, fontWeight: 700,
        }}>
          <span>Total entry: {fmtRp(total)}</span>
          <span>Nominal transaksi: {fmtRp(perkiraan)}</span>
          <span>Selisih: {fmtRp(selisih)}</span>
          <span style={{ fontWeight: 600 }}>
            {balanced
              ? '✓ Nominal sudah sesuai, siap disimpan.'
              : 'Total entry harus persis sama dengan nominal transaksi.'}
          </span>
        </div>

        {/* Editable rows */}
        {loading && <div style={{ color: T.gray, fontSize: 13, padding: 20 }}>Memuat data anak…</div>}

        {!loading && sourceError && (
          <div style={{ color: T.red, fontSize: 13, background: T.redPale, padding: 12, borderRadius: 10 }}>
            {String((sourceError as Error).message || sourceError)}
          </div>
        )}

        {!loading && !sourceError && draft.length === 0 && (
          <div style={{ color: T.gray, fontSize: 13, background: T.grayLt, padding: 14, borderRadius: 10 }}>
            {mode === 'create' ? (
              <>
                Tidak ada anak pasangan aktif untuk donatur <strong>{candidates.criteria?.id_donatur}</strong>{' '}
                pada program <strong>{candidates.criteria?.program}</strong> tahun{' '}
                <strong>{candidates.criteria?.tahun}</strong>. Periksa data pemasangan atau bulan/tahun salur.
              </>
            ) : (
              <>Belum ada entry tersimpan untuk transaksi ini.</>
            )}
          </div>
        )}

        {draft.length > 0 && (
          <div style={{
            border: `1.5px solid ${T.primarySoft}`, borderRadius: 12, overflow: 'hidden',
            maxHeight: 340, overflowY: 'auto',
          }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 720 }}>
              <thead>
                <tr style={{ background: T.primaryPale, position: 'sticky', top: 0, zIndex: 1 }}>
                  {['#', 'Anak', 'Harga satuan', 'Qty', 'Nominal', ''].map((h, i) => (
                    <th key={h + i} style={{
                      fontSize: 11, fontWeight: 800, color: T.primaryDk, textTransform: 'uppercase',
                      letterSpacing: 0.4, padding: '9px 10px', textAlign: i >= 2 && i <= 4 ? 'right' : 'left',
                      borderBottom: `1.5px solid ${T.primarySoft}`, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draft.map((r, i) => (
                  <tr key={r.id_anak} style={{ background: i % 2 === 0 ? T.white : '#FDFAF8' }}>
                    <td style={cell}>{i + 1}</td>
                    <td style={cell}>
                      <div style={{ fontWeight: 600 }}>{r.nama_anak || r.id_anak}</div>
                      <div style={{ fontSize: 10, color: T.gray }}>{r.id_anak}</div>
                    </td>
                    <td style={{ ...cell, textAlign: 'right' }}>
                      <Input
                        type="number"
                        value={r.pilihan_donasi}
                        onChange={e => patch(r.id_anak, { pilihan_donasi: Number(e.target.value) || 0 })}
                        style={{ textAlign: 'right', padding: '5px 8px', fontSize: 12 }}
                      />
                    </td>
                    <td style={{ ...cell, textAlign: 'right', width: 90 }}>
                      <Input
                        type="number"
                        value={r.qty}
                        onChange={e => patch(r.id_anak, { qty: Number(e.target.value) || 0 })}
                        style={{ textAlign: 'right', padding: '5px 8px', fontSize: 12 }}
                      />
                    </td>
                    <td style={{ ...cell, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {fmtRp(r.nominal_donasi)}
                    </td>
                    <td style={{ ...cell, width: 44 }}>
                      <button
                        type="button"
                        onClick={() => remove(r.id_anak)}
                        aria-label={`Hapus ${r.nama_anak}`}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: T.red, display: 'flex', padding: 4,
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={!balanced || saving}>
            {saving ? 'Menyimpan…' : mode === 'create' ? 'Simpan Entry' : 'Simpan Perubahan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

const cell: React.CSSProperties = {
  fontSize: 12, padding: '7px 10px', borderBottom: `1px solid ${T.grayLt}`,
  color: T.charcoal, verticalAlign: 'middle',
};

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: strong ? 800 : 600, color: T.charcoal }}>{value}</div>
    </div>
  );
}
