'use client';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { buildRowActions, rowKeyOf, type RowHandlers } from '@/components/transaksi/TransaksiTable';
import { fmtRp, fmtTgl } from '@/lib/utils';
import type { Transaksi, TransaksiScope } from '@/types/transaksi';

const T = {
  primarySoft: '#F0C4A0', charcoal: '#1A0A00', gray: '#7A6055', white: '#FFFFFF',
  green: '#1A7A45', greenPale: '#E5F5ED', red: '#B02020', gold: '#B87800', goldPale: '#FDF4DC',
};

interface Props extends RowHandlers {
  data:     Transaksi[];
  loading:  boolean;
  scope:    TransaksiScope;
  isAdmin:  boolean;
  selected: Set<string>;
  onToggle: (idReview: string) => void;
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
      <span style={{ color: T.gray }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

/** Mobile (≤700px) rendering of the same rows the desktop table shows. */
export function TransaksiCard({
  data, loading, scope, isAdmin, selected, onToggle, ...handlers
}: Props) {
  if (loading) {
    return (
      <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 150, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{
        background: T.white, border: `1.5px solid ${T.primarySoft}`, borderRadius: 14,
        padding: 30, textAlign: 'center', color: T.gray, fontSize: 13,
      }}>
        Tidak ada transaksi untuk filter ini.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(r => {
        const selisih = Number(r.selisih_donasi || 0);
        return (
          <div key={rowKeyOf(r)} style={{
            background: T.white, border: `1.5px solid ${T.primarySoft}`,
            borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', minWidth: 0 }}>
                {scope === 'review' && (
                  <input
                    type="checkbox"
                    checked={selected.has(r.id_review)}
                    onChange={() => onToggle(r.id_review)}
                    style={{ accentColor: '#BF4E02', width: 16, height: 16, marginTop: 3 }}
                  />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: T.charcoal }}>
                    {r.nama_donatur || '-'}
                  </div>
                </div>
              </div>
              <RowActions items={buildRowActions(r, handlers, isAdmin)} label={`Aksi ${r.transid}`} />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {r.status_pasang === 'y'
                ? <Badge label="Sudah dientry" color={T.green} bg={T.greenPale} />
                : <Badge label="Belum dientry" color={T.gold} bg={T.goldPale} />}
              {r.approve_salur === 'y' && <Badge label="Approve salur" color={T.green} bg={T.greenPale} />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Line label="ID Donatur" value={r.did || '-'} />
              <Line label="Trans ID" value={r.transid} />
              <Line label="Detail ID" value={r.detailid} />
              <Line label="Program" value={r.nama_program || '-'} />
              <Line label="Nominal" value={fmtRp(r.perkiraan_rp)} />
              <Line label="Terinput" value={fmtRp(r.total_input_donasi)} />
              <Line
                label="Selisih"
                value={<span style={{ color: selisih === 0 ? T.green : T.red }}>{fmtRp(selisih)}</span>}
              />
              <Line label="Bulan salur" value={r.bulan_salur || '-'} />
              <Line label="Tahun salur" value={r.tahun_salur || '-'} />
              <Line label="Tgl transaksi" value={fmtTgl(r.tgl_transaksi)} />
              <Line label="Anak IJIS" value={`${r.jml_anak_ijis ?? 0} anak`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
