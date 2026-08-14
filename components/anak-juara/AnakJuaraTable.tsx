'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { fmtTgl } from '@/lib/utils';
import type { KeuanganPivot, SemesterBlock } from '@/lib/keuangan';
import type { AnakJuaraRow } from '@/types/anak-juara';

interface AnakJuaraTableProps {
  data:        AnakJuaraRow[];
  loading:     boolean;
  rowOffset?:  number;
  selectedId?: string | null;
  sortBy?:     string;
  sortDir?:    'asc' | 'desc';
  onSort?:     (sortKey: string) => void;
  onSelect:    (row: AnakJuaraRow) => void;
  /** Per-page finance pivot, keyed by id_pemasangan_baru. Fills in after the grid. */
  keuangan?:        Record<string, KeuanganPivot>;
  keuanganLoading?: boolean;
}

const SELECTED = '#1A7A45';
const MUTED = '#7A6055';
const CHARCOAL = '#1A0A00';
const PRIMARY = '#BF4E02';
/** Whole row turns red when the pairing is no longer active. */
const INACTIVE = '#B02020';

function fmtRp(n: number | undefined) {
  return Number(n || 0).toLocaleString('id-ID');
}

export function AnakJuaraTable({
  data, loading, rowOffset = 0, selectedId, sortBy, sortDir, onSort, onSelect,
  keuangan = {}, keuanganLoading = false,
}: AnakJuaraTableProps) {
  const isSel = (r: AnakJuaraRow) =>
    !!selectedId && r.id_pemasangan_baru === selectedId;
  const isOff = (r: AnakJuaraRow) => r.status_pasangan !== 'y';

  /**
   * Cell color: selection wins, then the inactive-row red, then the cell's own
   * intent. Renderers must go through this or they would paint over the row color.
   */
  const tone = (r: AnakJuaraRow, base?: string) =>
    isSel(r) ? SELECTED : isOff(r) ? INACTIVE : base;

  const pivotOf = (r: AnakJuaraRow) => keuangan[r.id_pemasangan_baru];

  /** Money cell: '…' while the finance request is still in flight. */
  const money = (pick: (k: KeuanganPivot) => number) => {
    const MoneyCell = (r: AnakJuaraRow) => {
      const k = pivotOf(r);
      if (!k) return <span style={{ color: tone(r, MUTED) }}>{keuanganLoading ? '…' : '0'}</span>;
      return <>{fmtRp(pick(k))}</>;
    };
    return MoneyCell;
  };

  const monthCols = (
    group: string,
    semester: 'ganjil' | 'genap',
    field: 'donasi' | 'penyaluran',
  ) => {
    const labels = semester === 'ganjil'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']
      : ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return labels.map((label, idx) => ({
      key: `${field}-${semester}-${idx}`,
      label,
      width: 88,
      group,
      align: 'right' as const,
      render: money(k => (k[semester] as SemesterBlock)[field][idx]?.total ?? 0),
    }));
  };

  const semesterCols = (semester: 'ganjil' | 'genap') => {
    const suffix = semester === 'ganjil' ? 'Jan – Jun' : 'Jul – Des';
    return [
      {
        key: `saldo-awal-${semester}`,
        label: `Saldo Awal ${suffix}`,
        width: 120, group: '', align: 'right' as const,
        render: money(k => k[semester].saldo_awal),
      },
      ...monthCols(`Donasi ${suffix}`, semester, 'donasi'),
      {
        key: `jml-donasi-${semester}`,
        label: `Σ Donasi ${suffix}`,
        width: 120, group: '', align: 'right' as const,
        render: money(k => k[semester].jml_donasi),
      },
      {
        key: `saldo-plus-${semester}`,
        label: `Σ Saldo + Donasi ${suffix}`,
        width: 150, group: '', align: 'right' as const,
        render: money(k => k[semester].saldo_plus_donasi),
      },
      ...monthCols(`Penyaluran ${suffix}`, semester, 'penyaluran'),
      {
        key: `jml-salur-${semester}`,
        label: `Σ Tersalurkan ${suffix}`,
        width: 140, group: '', align: 'right' as const,
        render: money(k => k[semester].jml_tersalurkan),
      },
      {
        key: `saldo-akhir-${semester}`,
        label: `Saldo Akhir ${suffix}`,
        width: 130, group: '', align: 'right' as const,
        render: money(k => k[semester].saldo_akhir),
      },
      {
        key: `aktif-${semester}`,
        label: `Aktif ${suffix}`,
        width: 100, group: '',
        render: (r: AnakJuaraRow) => {
          const k = pivotOf(r);
          if (!k) return <span style={{ color: tone(r, MUTED) }}>—</span>;
          const v = k[semester].aktif;
          return (
            <Badge
              label={v || '—'}
              color={v === 'Aktif' ? '#1A7A45' : '#B02020'}
              bg={v === 'Aktif' ? '#E5F5ED' : '#FDEAEA'}
            />
          );
        },
      },
      {
        key: `wajib-${semester}`,
        label: `Wajib ${suffix}`,
        width: 130, group: '',
        render: (r: AnakJuaraRow) => {
          const k = pivotOf(r);
          return <span>{k?.[semester].wajib || '—'}</span>;
        },
      },
    ];
  };

  const columns = [
    {
      key: 'no',
      label: '#',
      width: 36,
      sticky: true,
      left: 0,
      render: (r: AnakJuaraRow, i: number) => (
        <span style={{ fontWeight: 700, color: tone(r, MUTED) }}>
          {rowOffset + i + 1}
        </span>
      ),
    },
    {
      key: 'id_anak',
      label: 'ID Anak',
      width: 100,
      sticky: true,
      left: 36,
      sortable: true,
      sortKey: 'id_anak',
      render: (r: AnakJuaraRow) => (
        <span style={{ fontWeight: 700, color: tone(r, PRIMARY) }}>{r.id_anak}</span>
      ),
    },
    {
      key: 'nama_anak',
      label: 'Nama Anak',
      width: 200,
      sticky: true,
      left: 136,
      sortable: true,
      sortKey: 'nama_anak',
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: tone(r, CHARCOAL) }}>
            {r.nama_anak || '—'}
          </div>
          <div style={{ fontSize: 11, color: tone(r, MUTED), opacity: isSel(r) ? 0.85 : 1 }}>
            {r.jenjang_pendidikan} {r.kelas || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 90,
      sticky: true,
      left: 336,
      sortable: true,
      sortKey: 'status_pasangan',
      render: (r: AnakJuaraRow) => (
        <Badge
          label={r.status_pasangan === 'y' ? 'Aktif' : 'Nonaktif'}
          color={tone(r, '#1A7A45') ?? '#1A7A45'}
          bg={isSel(r) || r.status_pasangan === 'y' ? '#E5F5ED' : '#FDEAEA'}
        />
      ),
    },
    {
      key: 'donatur',
      label: 'Donatur',
      width: 180,
      sticky: true,
      left: 426,
      sep: true,
      sortable: true,
      sortKey: 'nama_donatur',
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 600, color: tone(r, CHARCOAL) }}>
            {r.nama_donatur || '—'}
          </div>
          <div style={{ fontSize: 11, color: tone(r, MUTED), opacity: isSel(r) ? 0.85 : 1 }}>
            {r.id_donatur}
          </div>
        </div>
      ),
    },
    {
      key: 'program',
      label: 'Program',
      width: 280,
      sortable: true,
      sortKey: 'program_donasi',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: tone(r) }}>{r.program_donasi || '—'}</span>
      ),
    },
    {
      key: 'rfo',
      label: 'Funding',
      width: 150,
      sortable: true,
      sortKey: 'nama_rfo',
      render: (r: AnakJuaraRow) => (
        <div>
          <div style={{ fontWeight: 600, color: tone(r, CHARCOAL) }}>{r.nama_rfo || '—'}</div>
          <div style={{ fontSize: 11, color: tone(r, MUTED), opacity: isSel(r) ? 0.85 : 1 }}>
            {r.nia_rfo}
          </div>
        </div>
      ),
    },
    {
      key: 'kantor',
      label: 'Kantor',
      width: 140,
      sortable: true,
      sortKey: 'nama_kantor',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: tone(r) }}>{r.nama_kantor || '—'}</span>
      ),
    },
    {
      key: 'wilayah',
      label: 'Wilayah',
      width: 150,
      sortable: true,
      sortKey: 'nama_wilayah',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: tone(r) }}>{r.nama_wilayah || '—'}</span>
      ),
    },
    {
      key: 'tgl',
      label: 'Tgl Pasang',
      width: 110,
      sortable: true,
      sortKey: 'tgl_pemasangan',
      render: (r: AnakJuaraRow) => (
        <span style={{ color: tone(r) }}>{fmtTgl(r.tgl_pemasangan)}</span>
      ),
    },
    ...semesterCols('ganjil'),
    ...semesterCols('genap'),
    {
      key: 'date_generated',
      label: 'Date Generated',
      width: 130,
      group: '',
      render: (r: AnakJuaraRow) => <span>{fmtTgl(pivotOf(r)?.date_generated ?? '') || '—'}</span>,
    },
    {
      key: 'user_generated',
      label: 'User Generated',
      width: 130,
      group: '',
      render: (r: AnakJuaraRow) => <span>{pivotOf(r)?.user_generated || '—'}</span>,
    },
  ];

  const totalWidth = columns.reduce((a, c) => a + c.width, 0);

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={r => r.id_pemasangan_baru}
      loading={loading}
      selectedKey={selectedId}
      selectedTextColor={SELECTED}
      rowTextColor={r => (isOff(r) ? INACTIVE : undefined)}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
      onRowClick={onSelect}
      minWidth={totalWidth}
      emptyText="Tidak ada data pemasangan Anak Juara."
    />
  );
}
