'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtRp, fmtTgl } from '@/lib/utils';
import type { Transaksi, TransaksiScope } from '@/types/transaksi';

const T = {
  green: '#1A7A45', greenPale: '#E5F5ED',
  red: '#B02020', redPale: '#FDEAEA',
  gold: '#B87800', goldPale: '#FDF4DC',
  gray: '#7A6055', grayLt: '#F2EAE3',
};

export interface RowHandlers {
  onEntry:         (row: Transaksi) => void;
  onUpdate:        (row: Transaksi) => void;
  onApproveSalur:  (row: Transaksi) => void;
  onGantiProgram:  (row: Transaksi) => void;
  onDeleteEntries: (row: Transaksi) => void;
  onDeletePerm:    (row: Transaksi) => void;
}

interface Props extends RowHandlers {
  data:       Transaksi[];
  loading:    boolean;
  scope:      TransaksiScope;
  isAdmin:    boolean;
  rowOffset:  number;
  sortBy?:    string;
  sortDir?:   'asc' | 'desc';
  onSort:     (key: string) => void;
  selected:   Set<string>;
  onToggle:   (idReview: string) => void;
}

export const rowKeyOf = (r: Transaksi) => `${r.transid}::${r.detailid}`;

/** Actions available for a row, in the order the legacy toolbar offered them. */
export function buildRowActions(row: Transaksi, h: RowHandlers, isAdmin: boolean) {
  const entered = row.status_pasang === 'y';
  return [
    {
      label: 'Entry Cashflow',
      onClick: () => h.onEntry(row),
      // Legacy showed an alert after the click; disabling states the same rule up front.
      disabled: entered || row.approve_salur === 'n',
    },
    { label: 'Update Cashflow', onClick: () => h.onUpdate(row), disabled: !entered },
    { label: 'Not / Approve Salur', onClick: () => h.onApproveSalur(row) },
    { label: 'Ganti Program', onClick: () => h.onGantiProgram(row) },
    { label: 'Hapus Entry Donasi', onClick: () => h.onDeleteEntries(row), danger: true, disabled: !entered },
    ...(isAdmin
      ? [{ label: 'Hapus Transaksi', onClick: () => h.onDeletePerm(row), danger: true }]
      : []),
  ];
}

export function TransaksiTable({
  data, loading, scope, isAdmin, rowOffset,
  sortBy, sortDir, onSort, selected, onToggle, ...handlers
}: Props) {
  const isReview = scope === 'review';

  const columns = [
    ...(isReview
      // Same width as the '#' column it replaces: DataTable derives the frozen-column
      // offsets from these declared widths, so the two tab variants must agree.
      ? [{
          key: 'pick', label: '', width: 52, sticky: true,
          render: (r: Transaksi) => (
            <input
              type="checkbox"
              checked={selected.has(r.id_review)}
              onChange={() => onToggle(r.id_review)}
              onClick={e => e.stopPropagation()}
              style={{ accentColor: '#BF4E02', width: 15, height: 15, cursor: 'pointer' }}
            />
          ),
        }]
      : [{
          key: 'no', label: '#', width: 52, sticky: true, align: 'right' as const,
          render: (_r: Transaksi, i: number) => (
            <span style={{ color: T.gray }}>{rowOffset + i + 1}</span>
          ),
        }]),
    {
      key: 'nama_donatur', label: 'Donatur', width: 210, sticky: true, sep: true, sortable: true,
      render: (r: Transaksi) => <span style={{ fontWeight: 700 }}>{r.nama_donatur || '-'}</span>,
    },
    {
      key: 'did', label: 'ID Donatur', width: 145,
      render: (r: Transaksi) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{r.did || '-'}</span>
      ),
    },
    {
      key: 'transid', label: 'Trans ID', width: 155, sortable: true,
      render: (r: Transaksi) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{r.transid}</span>
      ),
    },
    {
      key: 'detailid', label: 'Detail ID', width: 85, align: 'right' as const,
      render: (r: Transaksi) => r.detailid,
    },
    {
      // DataTable clips cells to the declared width. Sized for the longest name actually
      // present in `transaksi` — 49 chars, e.g. "Zakat untuk Program Beasiswa Pendidikan
      // Siswa SMP" — so the column never ellipsises in practice.
      key: 'nama_program', label: 'Program', width: 380, sortable: true,
      render: (r: Transaksi) => r.nama_program || '-',
    },
    {
      key: 'perkiraan_rp', label: 'Nominal', width: 130, align: 'right' as const, sortable: true,
      render: (r: Transaksi) => <strong>{fmtRp(r.perkiraan_rp)}</strong>,
    },
    {
      key: 'total_input_donasi', label: 'Terinput', width: 120, align: 'right' as const, sortable: true,
      render: (r: Transaksi) => fmtRp(r.total_input_donasi),
    },
    {
      key: 'selisih_donasi', label: 'Selisih', width: 120, align: 'right' as const, sortable: true, sep: true,
      render: (r: Transaksi) => {
        const s = Number(r.selisih_donasi || 0);
        return (
          <span style={{ color: s === 0 ? T.green : T.red, fontWeight: 700 }}>
            {fmtRp(s)}
          </span>
        );
      },
    },
    {
      key: 'status_pasang', label: 'Entry', width: 96,
      render: (r: Transaksi) => r.status_pasang === 'y'
        ? <Badge label="Sudah" color={T.green} bg={T.greenPale} />
        : <Badge label="Belum" color={T.gold} bg={T.goldPale} />,
    },
    {
      key: 'approve_salur', label: 'Approve', width: 96,
      render: (r: Transaksi) => r.approve_salur === 'y'
        ? <Badge label="Ya" color={T.green} bg={T.greenPale} />
        : r.approve_salur === 'n'
        ? <Badge label="Tidak" color={T.red} bg={T.redPale} />
        : <Badge label="-" color={T.gray} bg={T.grayLt} />,
    },
    {
      key: 'bulan_salur', label: 'Bulan Salur', width: 110, align: 'right' as const,
      render: (r: Transaksi) => r.bulan_salur || '-',
    },
    {
      key: 'tahun_salur', label: 'Tahun Salur', width: 110, align: 'right' as const, sep: true,
      render: (r: Transaksi) => r.tahun_salur || '-',
    },
    {
      key: 'tgl_transaksi', label: 'Tgl Transaksi', width: 120, sortable: true,
      render: (r: Transaksi) => fmtTgl(r.tgl_transaksi),
    },
    {
      key: 'tgl_donasi', label: 'Tgl Donasi', width: 120, sortable: true,
      render: (r: Transaksi) => fmtTgl(r.tgl_donasi),
    },
    {
      key: 'kantor_donatur', label: 'Kantor Donatur', width: 170, sortable: true,
      render: (r: Transaksi) => r.kantor_donatur || '-',
    },
    {
      key: 'jml_anak_ijis', label: 'Anak IJIS', width: 95, align: 'right' as const, sortable: true,
      render: (r: Transaksi) => r.jml_anak_ijis ?? 0,
    },
    {
      key: 'kantor_ijis', label: 'Kantor IJIS', width: 190,
      render: (r: Transaksi) => r.kantor_ijis || '-',
    },
    {
      key: 'jml_mustahik', label: 'Jml PM', width: 80, align: 'right' as const,
      render: (r: Transaksi) => r.jml_mustahik || '-',
    },
    {
      key: 'aksi', label: '', width: 56,
      render: (r: Transaksi) => (
        <RowActions
          items={buildRowActions(r, handlers, isAdmin)}
          label={`Aksi ${r.transid}`}
        />
      ),
    },
  ];

  return (
    <DataTable<Transaksi>
      columns={columns}
      data={data}
      loading={loading}
      rowKey={rowKeyOf}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
      gridLines
      // Exactly the sum of the column widths above, so the browser honours them as
      // declared instead of stretching them and shifting the sticky offsets.
      minWidth={2640}
      // A non-zero selisih is the operator's whole reason for scanning this grid.
      rowTextColor={r => (Number(r.selisih_donasi || 0) !== 0 ? T.red : undefined)}
      emptyText="Tidak ada transaksi untuk filter ini."
    />
  );
}
