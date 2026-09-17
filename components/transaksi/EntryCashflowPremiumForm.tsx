'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { useAnakKandidat, useTransaksiEntries } from '@/hooks/useTransaksi';
import { draftFromCandidate, draftFromEntry, draftFromNewCandidate, rowNominal, type DraftRow } from '@/lib/transaksi/entryDraft';
import { fmtRp, fmtTgl } from '@/lib/utils';
import type { Transaksi } from '@/types/transaksi';

const T = {
  primary: '#BF4E02', primaryDk: '#8F3A01', primarySoft: '#F0C4A0', primaryPale: '#FBF0E8',
  charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3', white: '#FFFFFF',
  green: '#1A7A45', greenPale: '#E5F5ED', red: '#B02020', redPale: '#FDEAEA',
};

interface Props {
  row:       Transaksi;
  /** Whether this transaction already has saved entries — decides create vs. update save. */
  entered:   boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

/**
 * A larger, bulk-oriented variant of EntryCashflowForm for donors with many sponsored
 * children (high jml_mustahik). Same data source, same draft shape, same save endpoint
 * as the standard modal — only the input ergonomics differ: a taller grid, a way to set
 * one price across every row, multi-select "tambah anak", and a grid-level search.
 */
export function EntryCashflowPremiumForm({ row, entered, onClose, onSuccess }: Props) {
  const mode: 'create' | 'update' = entered ? 'update' : 'create';
  const [qty, setQty] = useState(1);
  /** null = untouched, still mirroring the server. */
  const [edits, setEdits] = useState<DraftRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddAnak, setShowAddAnak] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [checkedToAdd, setCheckedToAdd] = useState<Set<string>>(new Set());
  const [gridSearch, setGridSearch] = useState('');
  const [flatPrice, setFlatPrice] = useState('');

  const candidates = useAnakKandidat(row.transid, row.detailid, qty, {
    enabled: mode === 'create',
  });
  const entries = useTransaksiEntries(row.transid, row.detailid, {
    enabled: mode === 'update',
  });
  const addCandidatesFetch = useAnakKandidat(row.transid, row.detailid, 1, {
    enabled: mode === 'update' && showAddAnak,
  });
  const addPool = mode === 'create' ? candidates.rows : addCandidatesFetch.rows;
  const addPoolLoading = mode === 'create' ? candidates.loading : addCandidatesFetch.loading;

  const seed: DraftRow[] = useMemo(() => {
    if (mode === 'create') return candidates.rows.map(draftFromCandidate);
    return entries.rows.map(draftFromEntry);
  }, [mode, candidates.rows, entries.rows]);

  const draft = edits ?? seed;
  const perkiraan = Math.round(Number(row.perkiraan_rp));
  const total = draft.reduce((s, r) => s + rowNominal(r), 0);
  const selisih = perkiraan - Math.round(total);
  const balanced = selisih === 0 && draft.length > 0;

  const loading = mode === 'create' ? candidates.loading : entries.loading;
  const sourceError = mode === 'create' ? candidates.error : entries.error;

  const patch = (idAnak: string, next: Partial<DraftRow>) => {
    setEdits(draft.map(r => {
      if (r.id_anak !== idAnak) return r;
      const merged = { ...r, ...next };
      if (next.qty !== undefined || next.pilihan_donasi !== undefined) {
        merged.nominal_donasi = Number(merged.pilihan_donasi) * Number(merged.qty);
      }
      return merged;
    }));
  };

  const remove = (idAnak: string) => setEdits(draft.filter(r => r.id_anak !== idAnak));

  const addableAnak = addPool.filter(c => {
    if (draft.some(d => d.id_anak === c.id_anak)) return false;
    if (!addSearch.trim()) return true;
    const q = addSearch.trim().toLowerCase();
    return c.nama_anak?.toLowerCase().includes(q) || c.id_anak?.toLowerCase().includes(q);
  });

  const toggleCheckedToAdd = (idAnak: string) => {
    setCheckedToAdd(prev => {
      const next = new Set(prev);
      if (next.has(idAnak)) next.delete(idAnak);
      else next.add(idAnak);
      return next;
    });
  };

  /** Adds every checked candidate to the draft in one shot. */
  const addSelected = () => {
    const chosen = addableAnak.filter(c => checkedToAdd.has(c.id_anak));
    if (chosen.length === 0) return;
    setEdits([...draft, ...chosen.map(draftFromNewCandidate)]);
    setCheckedToAdd(new Set());
  };

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

  /** Set the same harga satuan on every row, keeping each row's own qty. */
  const applyFlatPrice = () => {
    const price = Number(flatPrice);
    if (!Number.isFinite(price) || price <= 0 || draft.length === 0) return;
    setEdits(draft.map(r => ({ ...r, pilihan_donasi: price, nominal_donasi: price * Number(r.qty || 0) })));
  };

  const visibleDraft = useMemo(() => {
    if (!gridSearch.trim()) return draft;
    const q = gridSearch.trim().toLowerCase();
    return draft.filter(r => r.nama_anak?.toLowerCase().includes(q) || r.id_anak?.toLowerCase().includes(q));
  }, [draft, gridSearch]);

  const save = async () => {
    if (!balanced) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/anakjuara/transaksi/${encodeURIComponent(row.transid)}/${row.detailid}/entries`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
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
              nominal_donasi:       rowNominal(r),
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
      title={`Entry Premium — ${row.nama_donatur || row.did}`}
      onClose={onClose}
      maxWidth={1400}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                  setEdits(null);
                }}
              />
            </div>
          )}
          <div style={{ width: 170 }}>
            <FLabel>Harga satuan (semua)</FLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <Input
                type="number"
                placeholder="mis. 210000"
                value={flatPrice}
                onChange={e => setFlatPrice(e.target.value)}
              />
              <Btn variant="outline" size="sm" onClick={applyFlatPrice} disabled={draft.length === 0}>
                Terapkan
              </Btn>
            </div>
          </div>
          <Btn variant="outline" size="sm" onClick={distributeEvenly} disabled={draft.length === 0}>
            Bagi rata sesuai nominal
          </Btn>
          <Btn variant="ghost" size="sm" onClick={reload}>
            <RotateCcw size={14} /> Muat ulang
          </Btn>
          <Btn variant="outline" size="sm" onClick={() => setShowAddAnak(s => !s)}>
            {showAddAnak ? 'Tutup Tambah Anak' : '+ Tambah Anak'}
          </Btn>
        </div>

        {showAddAnak && (
          <div style={{
            border: `1.5px solid ${T.primarySoft}`, borderRadius: 12, padding: 12,
            display: 'flex', flexDirection: 'column', gap: 8, background: T.primaryPale,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Input
                placeholder="Cari nama atau ID anak…"
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                style={{ flex: 1, minWidth: 200 }}
              />
              <Btn
                size="sm"
                variant="primary"
                onClick={addSelected}
                disabled={checkedToAdd.size === 0}
              >
                + Tambah Terpilih ({checkedToAdd.size})
              </Btn>
            </div>
            {addPoolLoading && (
              <div style={{ color: T.gray, fontSize: 13 }}>Memuat kandidat anak…</div>
            )}
            {!addPoolLoading && addableAnak.length === 0 && (
              <div style={{ color: T.gray, fontSize: 13 }}>
                Tidak ada anak pasangan lain yang bisa ditambahkan untuk donatur/program ini.
              </div>
            )}
            {!addPoolLoading && addableAnak.length > 0 && (
              <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {addableAnak.map(c => (
                  <label
                    key={c.id_anak}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: T.white, borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={checkedToAdd.has(c.id_anak)}
                        onChange={() => toggleCheckedToAdd(c.id_anak)}
                        style={{ accentColor: T.primary, width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nama_anak || c.id_anak}</div>
                        <div style={{ fontSize: 10, color: T.gray }}>{c.id_anak}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

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
          <>
            <Input
              placeholder={`Cari di ${draft.length} baris anak…`}
              value={gridSearch}
              onChange={e => setGridSearch(e.target.value)}
            />
            <div style={{
              border: `1.5px solid ${T.primarySoft}`, borderRadius: 12, overflow: 'hidden',
              maxHeight: 560, overflowY: 'auto',
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
                  {visibleDraft.map((r, i) => (
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
                        {fmtRp(rowNominal(r))}
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
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={!balanced || saving}>
            {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
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
