'use client';
import { Btn } from '@/components/ui/Btn';
import { fmtTgl } from '@/lib/utils';
import type { AjuanGantiAnak } from '@/types/ajuan';

interface AjuanTableProps {
  data:       AjuanGantiAnak[];
  loading:    boolean;
  rowOffset?: number;
  onDelete:   (row: AjuanGantiAnak) => void;
  onUlangi:   (row: AjuanGantiAnak) => void;
  onEksekusi: (row: AjuanGantiAnak) => void;
}

function rowTextColor(row: AjuanGantiAnak): string {
  if (row.status_eksekusi === 'y') return '#1A5FA8';
  if (row.approve_funding === 'n') return '#B02020';
  if (row.approve_funding === 'y') return '#1A7A45';
  return '#1A0A00';
}

function approveLabel(v: string) {
  if (v === 'y') return 'Disetujui';
  if (v === 'n') return 'Ditolak';
  return 'Pending';
}

type ColDef = {
  key: string;
  label: string;
  width: number;
  sticky?: boolean;
  sep?: boolean;
};

/**
 * Column widths are the single source of truth.
 * Sticky `left` is the cumulative sum of previous sticky widths (box-sizing: border-box).
 * Freeze through Nama Donatur (Status → Donatur group).
 */
const COLS: ColDef[] = [
  { key: 'no',             label: '#',              width: 40,  sticky: true },
  { key: 'approve',        label: 'Approve',        width: 92,  sticky: true },
  { key: 'eksekusi',       label: 'Eksekusi',       width: 88,  sticky: true },
  { key: 'tgl_ajuan',      label: 'Tgl Ajuan',      width: 104, sticky: true },
  { key: 'tgl_approve',    label: 'Tgl Approve',    width: 104, sticky: true },
  { key: 'tgl_eksekusi',   label: 'Tgl Eksekusi',   width: 104, sticky: true },
  { key: 'kantor',         label: 'Kantor',         width: 120, sticky: true },
  { key: 'id_donatur',     label: 'ID Donatur',     width: 108, sticky: true },
  { key: 'nama_donatur',   label: 'Nama Donatur',   width: 150, sticky: true, sep: true },
  { key: 'id_anak',        label: 'ID Anak Asal',   width: 112 },
  { key: 'nama_anak_asal', label: 'Nama Anak Asal', width: 160 },
  { key: 'id_pengganti',   label: 'ID Pengganti',   width: 112 },
  { key: 'nama_pengganti', label: 'Nama Pengganti', width: 160 },
  { key: 'alasan',         label: 'Alasan',         width: 200 },
  { key: 'saldo',          label: 'Saldo',          width: 96 },
  { key: 'aksi',           label: 'Aksi',           width: 260 },
];

const TABLE_WIDTH = COLS.reduce((s, c) => s + c.width, 0);

/** Precompute sticky left offsets from column widths. */
const STICKY_LEFT: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  let left = 0;
  for (const c of COLS) {
    if (c.sticky) {
      map[c.key] = left;
      left += c.width;
    }
  }
  return map;
})();

const PAD = '6px 8px';
const HEAD_BG = '#FBF0E8';
const BORDER = '#F0C4A0';
const SEP = '#D96A1A';

export function AjuanTable({
  data, loading, rowOffset = 0, onDelete, onUlangi, onEksekusi,
}: AjuanTableProps) {
  if (loading) {
    return (
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: `1.5px solid ${BORDER}`, overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid #F2EAE3' }}>
            <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 16,
      border: `1.5px solid ${BORDER}`,
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            tableLayout: 'fixed',
            width: TABLE_WIDTH,
            minWidth: TABLE_WIDTH,
          }}
        >
          <colgroup>
            {COLS.map(c => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {COLS.map(c => {
                const sticky = !!c.sticky;
                const left = sticky ? STICKY_LEFT[c.key] : undefined;
                return (
                  <th
                    key={c.key}
                    style={{
                      boxSizing: 'border-box',
                      width: c.width,
                      minWidth: c.width,
                      maxWidth: c.width,
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#8F3A01',
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                      padding: PAD,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: c.key === 'saldo' ? 'right' : 'left',
                      fontFamily: 'inherit',
                      background: HEAD_BG,
                      borderBottom: `1.5px solid ${BORDER}`,
                      borderRight: c.sep ? `2px solid ${SEP}` : `1px solid ${BORDER}`,
                      position: 'sticky',
                      top: 0,
                      left: sticky ? left : undefined,
                      zIndex: sticky ? 5 : 4,
                    }}
                  >
                    {c.label}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={COLS.length}
                  style={{ textAlign: 'center', padding: 40, color: '#7A6055', fontSize: 14 }}
                >
                  Tidak ada ajuan pergantian.
                </td>
              </tr>
            )}

            {data.map((r, i) => {
              const color = rowTextColor(r);
              const bg = i % 2 === 0 ? '#FFFFFF' : '#FDFAF8';
              const canEksekusi = r.status_eksekusi !== 'y';
              const canUlangi = r.status_eksekusi !== 'y';
              const canDelete = r.status_eksekusi !== 'y';

              const values: Record<string, React.ReactNode> = {
                no:             rowOffset + i + 1,
                // Approval and execution are independent state machines: legacy could
                // execute an ajuan that funding never approved. Collapsing them into one
                // column made the approve filter look broken.
                approve:        approveLabel(r.approve_funding),
                eksekusi:       r.status_eksekusi === 'y' ? 'Sudah' : 'Belum',
                tgl_ajuan:      fmtTgl(r.tgl_ajuan),
                tgl_approve:    fmtTgl(r.tgl_approve_funding),
                tgl_eksekusi:   fmtTgl(r.tgl_eksekusi),
                kantor:         r.nama_kantor || r.id_kantor || '—',
                id_donatur:     r.id_donatur || '—',
                nama_donatur:   r.nama_donatur || '—',
                id_anak:        r.id_anak || '—',
                nama_anak_asal: r.nama_anak_asal || '—',
                id_pengganti:   r.id_anak_pengganti || '—',
                nama_pengganti: r.nama_anak_pengganti || '—',
                alasan:         r.alasan_pergantian || '—',
                saldo:          Number(r.pindah_saldo || 0).toLocaleString('id-ID'),
                aksi: (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    gap: 6,
                    alignItems: 'center',
                  }}>
                    <Btn size="sm" variant="primary" disabled={!canEksekusi} onClick={() => onEksekusi(r)}>
                      Eksekusi
                    </Btn>
                    <Btn size="sm" variant="outline" disabled={!canUlangi} onClick={() => onUlangi(r)}>
                      Ulangi
                    </Btn>
                    <Btn size="sm" variant="danger" disabled={!canDelete} onClick={() => onDelete(r)}>
                      Hapus
                    </Btn>
                  </div>
                ),
              };

              return (
                <tr key={r.id_ajuan}>
                  {COLS.map(c => {
                    const sticky = !!c.sticky;
                    const left = sticky ? STICKY_LEFT[c.key] : undefined;
                    return (
                      <td
                        key={c.key}
                        title={c.key === 'alasan' ? String(r.alasan_pergantian || '') : undefined}
                        style={{
                          boxSizing: 'border-box',
                          width: c.width,
                          minWidth: c.width,
                          maxWidth: c.width,
                          fontSize: c.key === 'approve' || c.key === 'eksekusi' ? 11 : 12,
                          fontWeight: c.key === 'approve' || c.key === 'eksekusi' || c.key === 'nama_donatur' || c.key === 'nama_anak_asal' || c.key === 'nama_pengganti'
                            ? 600
                            : 400,
                          color,
                          padding: PAD,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: c.key === 'aksi' ? 'clip' : 'ellipsis',
                          textAlign: c.key === 'saldo' ? 'right' : 'left',
                          fontFamily: 'inherit',
                          verticalAlign: 'middle',
                          lineHeight: 1.25,
                          background: bg,
                          borderBottom: '1px solid #F2EAE3',
                          borderRight: c.sep ? `2px solid ${SEP}` : `1px solid #F2EAE3`,
                          position: sticky ? 'sticky' : 'static',
                          left: sticky ? left : undefined,
                          zIndex: sticky ? 2 : 1,
                        }}
                      >
                        {values[c.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
