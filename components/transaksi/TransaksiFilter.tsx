'use client';
import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Btn } from '@/components/ui/Btn';
import { Input, Sel } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { useTransaksiOptions } from '@/hooks/useTransaksi';

const T = {
  primary: '#BF4E02', primarySoft: '#F0C4A0', primaryPale: '#FBF0E8',
  charcoal: '#1A0A00', gray: '#7A6055', white: '#FFFFFF',
};

export type Filters = Record<string, string>;

interface Props {
  value:    Filters;
  onApply:  (next: Filters) => void;
  isBranch: boolean;
}

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/**
 * Filter bar for the Transaksi grid.
 *
 * Filters are staged locally and only lifted on "Cari", matching LIST_SWR_OPTIONS: the
 * grid refetches when the user asks for it, not on every keystroke.
 */
export function TransaksiFilter({ value, onApply, isBranch }: Props) {
  const [draft, setDraft] = useState<Filters>(value);
  const [advanced, setAdvanced] = useState(false);
  const { kantorTransaksi, program } = useTransaksiOptions();

  const set = (k: string, v: string) => setDraft(d => ({ ...d, [k]: v }));

  const apply = () => {
    // Drop empties so the SWR key stays stable and zod defaults apply.
    const cleaned: Filters = {};
    Object.entries(draft).forEach(([k, v]) => { if (v !== '') cleaned[k] = v; });
    onApply(cleaned);
  };

  const reset = () => {
    setDraft({});
    onApply({});
  };

  const activeCount = Object.values(draft).filter(v => v !== '').length;

  return (
    <div style={{
      background: T.white, border: `1.5px solid ${T.primarySoft}`,
      borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 240px', minWidth: 200 }}>
          <FLabel>Kata kunci</FLabel>
          <Input
            value={draft.q ?? ''}
            onChange={e => set('q', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') apply(); }}
            placeholder="Nama donatur, transid, DID, kantor…"
          />
        </div>

        <div style={{ flex: '1 1 150px', minWidth: 130 }}>
          <FLabel>Basis tanggal</FLabel>
          <Sel value={draft.date_basis ?? 'tgl_transaksi'} onChange={e => set('date_basis', e.target.value)}>
            <option value="tgl_transaksi">Tgl Transaksi</option>
            <option value="tgl_donasi">Tgl Donasi</option>
          </Sel>
        </div>

        <div style={{ flex: '1 1 140px', minWidth: 130 }}>
          <FLabel>Dari</FLabel>
          <Input type="date" value={draft.tgl_awal ?? ''} onChange={e => set('tgl_awal', e.target.value)} />
        </div>

        <div style={{ flex: '1 1 140px', minWidth: 130 }}>
          <FLabel>Sampai</FLabel>
          <Input type="date" value={draft.tgl_akhir ?? ''} onChange={e => set('tgl_akhir', e.target.value)} />
        </div>

        <Btn variant="primary" onClick={apply}>
          <Search size={15} /> Cari
        </Btn>
        <Btn variant="outline" onClick={() => setAdvanced(a => !a)}>
          <SlidersHorizontal size={15} />
          {advanced ? 'Tutup' : 'Filter Lanjutan'}
        </Btn>
        {activeCount > 0 && (
          <Btn variant="ghost" onClick={reset}>
            <X size={15} /> Reset
          </Btn>
        )}
      </div>

      {advanced && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 10, borderTop: `1px solid ${T.primaryPale}`, paddingTop: 12,
        }}>
          <div>
            <FLabel>Program</FLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <Sel value={draft.progid_op ?? 'eq'} onChange={e => set('progid_op', e.target.value)} style={{ width: 62 }}>
                <option value="eq">=</option>
                <option value="ne">≠</option>
              </Sel>
              <Sel value={draft.progid ?? ''} onChange={e => set('progid', e.target.value)}>
                <option value="">Semua program</option>
                {program.map(p => (
                  <option key={p.id_program} value={p.progid}>{p.nama_program}</option>
                ))}
              </Sel>
            </div>
          </div>

          <div>
            <FLabel>Kategori program</FLabel>
            <Input
              value={draft.kategori ?? ''}
              onChange={e => set('kategori', e.target.value)}
              placeholder="cth. Juara"
            />
          </div>

          <div>
            <FLabel>Nominal</FLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <Sel value={draft.nominal_op ?? 'eq'} onChange={e => set('nominal_op', e.target.value)} style={{ width: 62 }}>
                <option value="eq">=</option>
                <option value="ne">≠</option>
                <option value="lt">&lt;</option>
                <option value="gt">&gt;</option>
              </Sel>
              <Input type="number" value={draft.nominal ?? ''} onChange={e => set('nominal', e.target.value)} />
            </div>
          </div>

          <div>
            <FLabel>Jumlah PM</FLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <Sel value={draft.jml_pm_op ?? 'eq'} onChange={e => set('jml_pm_op', e.target.value)} style={{ width: 62 }}>
                <option value="eq">=</option>
                <option value="ne">≠</option>
              </Sel>
              <Input type="number" value={draft.jml_pm ?? ''} onChange={e => set('jml_pm', e.target.value)} />
            </div>
          </div>

          <div>
            <FLabel>Bulan disantuni</FLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <Sel value={draft.bulan_disantuni_op ?? 'eq'} onChange={e => set('bulan_disantuni_op', e.target.value)} style={{ width: 62 }}>
                <option value="eq">=</option>
                <option value="ne">≠</option>
              </Sel>
              <Input type="number" value={draft.bulan_disantuni ?? ''} onChange={e => set('bulan_disantuni', e.target.value)} />
            </div>
          </div>

          <div>
            <FLabel>Jml anak IJIS</FLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <Sel value={draft.jml_anak_ijis_op ?? 'eq'} onChange={e => set('jml_anak_ijis_op', e.target.value)} style={{ width: 70 }}>
                <option value="eq">=</option>
                <option value="ne">≠</option>
                <option value="lt">&lt;</option>
                <option value="gt">&gt;</option>
                <option value="lte">≤</option>
                <option value="gte">≥</option>
              </Sel>
              <Input type="number" value={draft.jml_anak_ijis ?? ''} onChange={e => set('jml_anak_ijis', e.target.value)} />
            </div>
          </div>

          <div>
            <FLabel>Kantor transaksi</FLabel>
            <Sel value={draft.oid_transaksi ?? ''} onChange={e => set('oid_transaksi', e.target.value)}>
              <option value="">Semua</option>
              {kantorTransaksi.map(k => <option key={k.oid} value={k.oid}>{k.kantor}</option>)}
            </Sel>
          </div>

          <div>
            <FLabel>Kantor donatur</FLabel>
            <Sel value={draft.oid_donatur ?? ''} onChange={e => set('oid_donatur', e.target.value)}>
              <option value="">Semua</option>
              {kantorTransaksi.map(k => <option key={k.oid} value={k.oid}>{k.kantor}</option>)}
            </Sel>
          </div>

          <div>
            <FLabel>Bulan salur</FLabel>
            <Sel value={draft.bulan_salur ?? ''} onChange={e => set('bulan_salur', e.target.value)}>
              <option value="">Semua</option>
              {BULAN.map((b, i) => <option key={b} value={String(i + 1)}>{b}</option>)}
            </Sel>
          </div>

          <div>
            <FLabel>Tahun salur</FLabel>
            <Input
              type="number"
              value={draft.tahun_salur ?? ''}
              onChange={e => set('tahun_salur', e.target.value)}
              placeholder="cth. 2026"
            />
          </div>

          <div>
            <FLabel>Status pasang</FLabel>
            <Sel value={draft.status_pasang ?? ''} onChange={e => set('status_pasang', e.target.value)}>
              <option value="">Semua</option>
              <option value="y">Sudah dientry</option>
              <option value="n">Belum dientry</option>
            </Sel>
          </div>

          {/* A branch's scope already pins approve_salur='y'; offering the control would
              suggest it can be widened. */}
          {!isBranch && (
            <div>
              <FLabel>Approve salur</FLabel>
              <Sel value={draft.approve_salur ?? ''} onChange={e => set('approve_salur', e.target.value)}>
                <option value="">Semua</option>
                <option value="y">Disetujui</option>
                <option value="n">Tidak disetujui</option>
              </Sel>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              color: T.charcoal, fontWeight: 600, cursor: 'pointer', paddingBottom: 8,
            }}>
              <input
                type="checkbox"
                checked={draft.only_selisih === '1'}
                onChange={e => set('only_selisih', e.target.checked ? '1' : '')}
                style={{ accentColor: T.primary, width: 16, height: 16 }}
              />
              Hanya yang selisih
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
