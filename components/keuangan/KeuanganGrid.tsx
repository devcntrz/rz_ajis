'use client';
import type { KeuanganPivot, MonthCell, SemesterBlock } from '@/lib/keuangan';

export interface KeuanganGridRow {
  key:       string;
  tahun:     string;
  id_anak:   string;
  nama_anak: string;
  /** Absent while the pivot is still loading; the grid keeps its column count. */
  pivot?:    KeuanganPivot;
}

interface KeuanganGridProps {
  rows:      KeuanganGridRow[];
  hint?:     string;
  emptyText?: string;
}

/**
 * The Jan–Des finance pivot, identical to the Anak Juara grid.
 * Shared by the Ganti Anak eksekusi modal and the Update Opname modal so the two
 * can never drift apart — this markup was duplicated once and would have been
 * duplicated a third time otherwise.
 */
export function KeuanganGrid({
  rows,
  hint = 'Keuangan → silakan scroll ke kanan untuk mengetahui data penyaluran dan saldo akhir',
  emptyText = 'Tidak ada data keuangan.',
}: KeuanganGridProps) {
  return (
    <div>
      <div style={{
        background: '#E5EEF8', color: '#1A5FA8', fontSize: 12, fontWeight: 700,
        padding: '8px 10px', borderRadius: '10px 10px 0 0', border: '1px solid #1A5FA830',
        borderBottom: 'none',
      }}>
        {hint}
      </div>
      <div style={{
        overflowX: 'auto', border: '1px solid #F0C4A0', borderRadius: '0 0 10px 10px',
        background: '#FFFFFF',
      }}>
        {/* borderCollapse must be 'separate': collapsed borders detach from sticky
            cells and scroll away with the rest of the row. */}
        <table style={{
          borderCollapse: 'separate', borderSpacing: 0,
          width: 'max-content', minWidth: '100%',
        }}>
          {/* Fixed widths keep the sticky offsets below exact — a column that
              renders wider than its offset lets the next one show through. */}
          <colgroup>
            {FROZEN.map(f => <col key={f.key} style={{ width: f.width }} />)}
          </colgroup>
          <thead>
            <tr style={{ background: '#FBF0E8' }}>
              {FROZEN.map((f, i) => (
                <th key={f.key} style={{ ...thBase, ...stickyHead(i) }} rowSpan={2}>{f.label}</th>
              ))}
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Saldo Awal Jan–Jun</th>
              <th style={{ ...thBase, textAlign: 'center' }} colSpan={6}>Donasi Jan – Jun</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Σ Donasi Jan – Jun</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Σ Saldo + Donasi Jan – Jun</th>
              <th style={{ ...thBase, textAlign: 'center' }} colSpan={6}>Penyaluran Jan – Jun</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Σ Tersalurkan Jan – Jun</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Saldo Akhir Jan – Jun</th>
              <th style={thBase} rowSpan={2}>Aktif Jan – Jun</th>
              <th style={thBase} rowSpan={2}>Wajib Jan – Jun</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Saldo Awal Jul – Des</th>
              <th style={{ ...thBase, textAlign: 'center' }} colSpan={6}>Donasi Jul – Des</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Σ Donasi Jul – Des</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Σ Saldo + Donasi Jul – Des</th>
              <th style={{ ...thBase, textAlign: 'center' }} colSpan={6}>Penyaluran Jul – Des</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Σ Tersalurkan Jul – Des</th>
              <th style={{ ...thBase, textAlign: 'right' }} rowSpan={2}>Saldo Akhir Jul – Des</th>
              <th style={thBase} rowSpan={2}>Aktif Jul – Des</th>
              <th style={thBase} rowSpan={2}>Wajib Jul – Des</th>
              <th style={thBase} rowSpan={2}>Date Generated</th>
              <th style={thBase} rowSpan={2}>User Generated</th>
            </tr>
            <tr style={{ background: '#FBF0E8' }}>
              {([
                ['dg', rows[0]?.pivot?.ganjil.donasi],
                ['pg', rows[0]?.pivot?.ganjil.penyaluran],
                ['dn', rows[0]?.pivot?.genap.donasi],
                ['pn', rows[0]?.pivot?.genap.penyaluran],
              ] as const).flatMap(([prefix, group], gi) =>
                (group ?? FALLBACK_MONTHS[gi < 2 ? 0 : 1]).map(m => (
                  <th key={`${prefix}-${m.bulan}`} style={{ ...thBase, textAlign: 'right' }}>
                    {m.label}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={FROZEN.length + 34} style={{ ...tdLeft, textAlign: 'center', padding: 24, color: '#7A6055' }}>
                  {emptyText}
                </td>
              </tr>
            )}
            {rows.map(r => (
              <tr key={r.key}>
                <td style={{ ...tdLeft, ...stickyCell(0) }}>{r.tahun || '—'}</td>
                <td style={{ ...tdLeft, ...stickyCell(1) }}>{r.id_anak || '—'}</td>
                <td style={{ ...tdLeft, ...stickyCell(2) }}>{r.nama_anak || '—'}</td>
                {([r.pivot?.ganjil, r.pivot?.genap] as (SemesterBlock | undefined)[]).map((s, si) => (
                  <SemesterCells key={si} s={s} fallbackIndex={si} />
                ))}
                <td style={tdLeft}>{fmtTanggal(r.pivot?.date_generated)}</td>
                <td style={tdLeft}>{r.pivot?.user_generated || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmtRp(n: number) {
  return Number(n || 0).toLocaleString('id-ID');
}

function fmtTanggal(v: string | null | undefined) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('id-ID');
}

/** Placeholder month cells so the header/body column count stays stable while loading. */
const FALLBACK_MONTHS: MonthCell[][] = [
  ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'].map((label, i) => ({ bulan: String(i + 1), label, total: 0 })),
  ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((label, i) => ({ bulan: String(i + 7), label, total: 0 })),
];

function SemesterCells({ s, fallbackIndex }: { s: SemesterBlock | undefined; fallbackIndex: number }) {
  const months = s?.donasi ?? FALLBACK_MONTHS[fallbackIndex];
  const salur = s?.penyaluran ?? FALLBACK_MONTHS[fallbackIndex];
  return (
    <>
      <td style={tdRight}>{fmtRp(s?.saldo_awal ?? 0)}</td>
      {months.map(m => <td key={`d${m.bulan}`} style={tdRight}>{fmtRp(m.total)}</td>)}
      <td style={tdRight}>{fmtRp(s?.jml_donasi ?? 0)}</td>
      <td style={tdRight}>{fmtRp(s?.saldo_plus_donasi ?? 0)}</td>
      {salur.map(m => <td key={`p${m.bulan}`} style={tdRight}>{fmtRp(m.total)}</td>)}
      <td style={tdRight}>{fmtRp(s?.jml_tersalurkan ?? 0)}</td>
      <td style={tdRight}>{fmtRp(s?.saldo_akhir ?? 0)}</td>
      <td style={tdLeft}>{s?.aktif || '—'}</td>
      <td style={tdLeft}>{s?.wajib || '—'}</td>
    </>
  );
}

const thBase: React.CSSProperties = {
  fontSize: 10, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase',
  padding: '6px 8px', whiteSpace: 'nowrap', textAlign: 'left',
  borderBottom: '1px solid #F0C4A0', borderRight: '1px solid #F2EAE3',
};

const tdLeft: React.CSSProperties = {
  fontSize: 11, padding: '6px 8px', whiteSpace: 'nowrap', borderBottom: '1px solid #F2EAE3',
  borderRight: '1px solid #F2EAE3', color: '#1A0A00', textAlign: 'left',
};

const tdRight: React.CSSProperties = {
  ...tdLeft,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

/** Frozen identity columns, in order. */
const FROZEN = [
  { key: 'tahun', label: 'Tahun', width: 70 },
  { key: 'id_anak', label: 'ID Anak', width: 130 },
  { key: 'nama_anak', label: 'Nama Anak', width: 190 },
] as const;

/** Cumulative left offset of frozen column `i`. */
const frozenLeft = (i: number) =>
  FROZEN.slice(0, i).reduce((a, f) => a + f.width, 0);

const FREEZE_SHADOW = '2px 0 4px -2px rgba(26,10,0,0.28)';

function frozen(i: number, bg: string, zIndex: number): React.CSSProperties {
  const w = FROZEN[i].width;
  return {
    position: 'sticky',
    left: frozenLeft(i),
    zIndex,
    background: bg,
    // Pinned to an exact width so the offsets above can never drift.
    width: w, minWidth: w, maxWidth: w,
    overflow: 'hidden', textOverflow: 'ellipsis',
    boxShadow: i === FROZEN.length - 1 ? FREEZE_SHADOW : undefined,
  };
}

// Header outranks body so frozen headers are never painted over while scrolling.
const stickyHead = (i: number) => frozen(i, '#FBF0E8', 4);
const stickyCell = (i: number) => frozen(i, '#FFFFFF', 2);
