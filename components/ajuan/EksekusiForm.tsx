'use client';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea } from '@/components/ui/Input';
import type { AjuanGantiAnak, DonasiPindahRow } from '@/types/ajuan';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface EksekusiFormProps {
  row: AjuanGantiAnak;
  onClose: () => void;
  onSuccess: () => void;
}

interface MonthCell {
  bulan: string;
  label: string;
  total: number;
}

interface SemesterBlock {
  saldo_awal: number;
  donasi: MonthCell[];
  jml_donasi: number;
  saldo_plus_donasi: number;
  penyaluran: MonthCell[];
  jml_tersalurkan: number;
  saldo_akhir: number;
  aktif: string;
  wajib: string;
}

interface DetailPayload {
  ajuan: AjuanGantiAnak & {
    jns_kelamin?: string;
  };
  pairing: {
    id_pemasangan_baru: string;
    tahun: string;
    id_anak: string;
    nama_anak: string;
    jns_kel: string;
    jenjang_pendidikan: string;
    kelas: string;
    asnaf: string;
    status_ortu: string;
    id_donatur: string;
    nama_donatur: string;
    program_donasi: string;
    id_program: number;
    nama_kantor: string;
    nama_wilayah: string;
    nia_rfo: string;
    nama_rfo: string;
    harga_program: number;
  } | null;
  opname: {
    saldo_awal_ganjil: number;
    saldo_akhir_ganjil: number;
    saldo_awal_genap: number;
    saldo_akhir_genap: number;
  };
  keuangan: {
    tahun: string;
    harga_program: number;
    months: MonthCell[];
    ganjil: SemesterBlock;
    genap: SemesterBlock;
    date_generated: string | null;
    user_generated: string | null;
  };
}

const numInputStyle: React.CSSProperties = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.45, minWidth: 0 }}>
      <div style={{ width: 118, flexShrink: 0, color: '#7A6055', fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#1A0A00', fontWeight: 600, minWidth: 0, wordBreak: 'break-word' }}>
        {value || '—'}
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

export function EksekusiForm({ row, onClose, onSuccess }: EksekusiFormProps) {
  const [keterangan, setKeterangan] = useState(row.alasan_pergantian || '');
  const [saldoAkhirGanti, setSaldoAkhirGanti] = useState(String(row.pindah_saldo || 0));
  const [saldoAwalGanjil, setSaldoAwalGanjil] = useState('0');
  const [saldoAkhirGanjil, setSaldoAkhirGanjil] = useState('0');
  const [saldoAwalGenap, setSaldoAwalGenap] = useState('0');
  const [saldoAkhirGenap, setSaldoAkhirGenap] = useState('0');
  const [selectedDonasi, setSelectedDonasi] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [opnameReady, setOpnameReady] = useState(false);

  // The caller already confirmed before mounting this form, so both requests
  // start immediately.
  const { data: detailRes, isLoading: detailLoading } = useSWR<{ data: DetailPayload }>(
    `/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/detail`,
    fetcher,
  );
  const { data: donasiRes, isLoading: donasiLoading } = useSWR<{ data: DonasiPindahRow[] }>(
    `/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/donasi-pindah`,
    fetcher,
  );

  const detail = detailRes?.data;
  const pairing = detail?.pairing;
  const donasiList = useMemo(() => donasiRes?.data ?? [], [donasiRes]);
  const ganjil = detail?.keuangan?.ganjil;
  const genap = detail?.keuangan?.genap;

  // Prefill saldo from opname, falling back to the computed semester balance (legacy-like).
  useEffect(() => {
    if (!detail || opnameReady) return;
    const o = detail.opname ?? ({} as DetailPayload['opname']);
    const k = detail.keuangan;
    setSaldoAwalGanjil(String(o.saldo_awal_ganjil ?? 0));
    setSaldoAkhirGanjil(String(o.saldo_akhir_ganjil || k?.ganjil?.saldo_akhir || 0));
    setSaldoAwalGenap(String(o.saldo_awal_genap ?? 0));
    const akhirGenap = Number(o.saldo_akhir_genap || k?.genap?.saldo_akhir || 0);
    setSaldoAkhirGenap(String(akhirGenap));
    if (!Number(row.pindah_saldo)) {
      setSaldoAkhirGanti(String(akhirGenap || 0));
    }
    setOpnameReady(true);
  }, [detail, opnameReady, row.pindah_saldo]);

  const toggleDonasi = (id: number) => {
    setSelectedDonasi(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const allSelected = donasiList.length > 0 && selectedDonasi.length === donasiList.length;
  const toggleAll = () => {
    setSelectedDonasi(allSelected ? [] : donasiList.map(d => d.id_input_donasi));
  };

  const handleSubmit = async () => {
    setError('');
    if (!keterangan.trim()) {
      setError('Alasan / keterangan pemberhentian wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/eksekusi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keterangan_pemberhentian: keterangan.trim(),
          saldo_akhir_ganti: Number(saldoAkhirGanti) || 0,
          saldo_awal_ganjil: Number(saldoAwalGanjil) || 0,
          saldo_akhir_ganjil: Number(saldoAkhirGanjil) || 0,
          saldo_awal_genap: Number(saldoAwalGenap) || 0,
          saldo_akhir_genap: Number(saldoAkhirGenap) || 0,
          id_input_donasi: selectedDonasi,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Gagal mengeksekusi.');
        return;
      }
      onSuccess();
    } catch {
      setError('Gagal mengeksekusi.');
    } finally {
      setSaving(false);
    }
  };

  const idAnak = pairing?.id_anak || row.id_anak;
  const namaAnak = pairing?.nama_anak || row.nama_anak_asal;

  return (
    <Modal title="Ganti Anak" onClose={onClose} maxWidth={1040}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Profile block — legacy-like key/value */}
        <div style={{
          background: '#FBF0E8', borderRadius: 12, padding: 12,
          border: '1px solid #F0C4A0',
        }}>
          {detailLoading && !detail ? (
            <div style={{ fontSize: 12, color: '#7A6055' }}>Memuat detail pemasangan...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '6px 18px',
            }}>
              <InfoRow label="ID Ajuan" value={row.id_ajuan} />
              <InfoRow label="ID Pasang" value={pairing?.id_pemasangan_baru || row.id_pemasangan_baru} />
              <InfoRow label="ID Anak" value={idAnak} />
              <InfoRow label="Nama Anak" value={namaAnak} />
              <InfoRow label="Jns Kel" value={(pairing?.jns_kel || row.jns_kelamin || '').toUpperCase()} />
              <InfoRow
                label="Pendidikan"
                value={[pairing?.jenjang_pendidikan, pairing?.kelas].filter(Boolean).join(' ') || '—'}
              />
              <InfoRow label="Asnaf" value={pairing?.asnaf} />
              <InfoRow label="Status Ortu" value={pairing?.status_ortu} />
              <InfoRow label="Program Donasi" value={pairing?.program_donasi || row.program_donasi} />
              <InfoRow label="ID Program" value={pairing?.id_program} />
              <InfoRow
                label="Donatur"
                value={`${pairing?.id_donatur || row.id_donatur} | ${pairing?.nama_donatur || row.nama_donatur}`}
              />
              <InfoRow label="Kantor" value={pairing?.nama_kantor || row.nama_kantor} />
              <InfoRow label="Wilayah" value={pairing?.nama_wilayah || row.nama_wilayah} />
              <InfoRow
                label="Funding"
                value={`${pairing?.nia_rfo || row.nia_rfo || '—'} | ${pairing?.nama_rfo || row.nama_rfo || '—'}`}
              />
            </div>
          )}
        </div>

        {/* Keuangan — legacy grouped pivot (Jan–Jun then Jul–Des) */}
        <div>
          <div style={{
            background: '#E5EEF8', color: '#1A5FA8', fontSize: 12, fontWeight: 700,
            padding: '8px 10px', borderRadius: '10px 10px 0 0', border: '1px solid #1A5FA830',
            borderBottom: 'none',
          }}>
            Keuangan → silakan scroll ke kanan untuk mengetahui data penyaluran dan saldo akhir
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
                    ['dg', ganjil?.donasi],
                    ['pg', ganjil?.penyaluran],
                    ['dn', genap?.donasi],
                    ['pn', genap?.penyaluran],
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
                <tr>
                  <td style={{ ...tdLeft, ...stickyCell(0) }}>{detail?.keuangan?.tahun || '—'}</td>
                  <td style={{ ...tdLeft, ...stickyCell(1) }}>{idAnak}</td>
                  <td style={{ ...tdLeft, ...stickyCell(2) }}>{namaAnak}</td>
                  {([ganjil, genap] as (SemesterBlock | undefined)[]).map((s, si) => (
                    <SemesterCells key={si} s={s} fallbackIndex={si} />
                  ))}
                  <td style={tdLeft}>{fmtTanggal(detail?.keuangan?.date_generated)}</td>
                  <td style={tdLeft}>{detail?.keuangan?.user_generated || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Anak baru */}
        <div>
          <FLabel>Pilih Anak Baru</FLabel>
          <Input value={`${row.id_anak_pengganti} | ${row.nama_anak_pengganti}`} disabled />
        </div>

        {/* Donasi yg pindah — legacy multi-select grid */}
        <div>
          <FLabel>Pilih Donasi yg pindah</FLabel>
          {donasiLoading && donasiList.length === 0 ? (
            <div style={emptyBoxStyle}>Memuat donasi...</div>
          ) : donasiList.length === 0 ? (
            <div style={emptyBoxStyle}>Tidak ada donasi yang bisa dipindahkan.</div>
          ) : (
            <div style={{
              maxHeight: 240, overflow: 'auto',
              border: '1px solid #F0C4A0', borderRadius: 10, background: '#FFFFFF',
            }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content', minWidth: '100%' }}>
                <thead>
                  <tr style={{ background: '#FBF0E8' }}>
                    <th style={{ ...thBase, width: 30, textAlign: 'center' }}>No</th>
                    <th style={{ ...thBase, width: 34, textAlign: 'center' }}>
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </th>
                    <th style={thBase}>ID Donasi</th>
                    <th style={thBase}>Transid</th>
                    <th style={thBase}>Detailid</th>
                    <th style={thBase}>Tgl Transaksi</th>
                    <th style={thBase}>Program</th>
                    <th style={{ ...thBase, textAlign: 'right' }}>QTY</th>
                    <th style={{ ...thBase, textAlign: 'right' }}>Nominal</th>
                    <th style={thBase}>Bulan</th>
                    <th style={thBase}>Tahun</th>
                    <th style={thBase}>Jenis</th>
                  </tr>
                </thead>
                <tbody>
                  {donasiList.map((d, i) => {
                    const checked = selectedDonasi.includes(d.id_input_donasi);
                    return (
                      <tr
                        key={d.id_input_donasi}
                        onClick={() => toggleDonasi(d.id_input_donasi)}
                        style={{ cursor: 'pointer', background: checked ? '#FBF0E8' : undefined }}
                      >
                        <td style={{ ...tdLeft, textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ ...tdLeft, textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDonasi(d.id_input_donasi)}
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                        <td style={tdLeft}>{d.id_input_donasi}</td>
                        <td style={tdLeft}>{d.transid || '—'}</td>
                        <td style={tdLeft}>{d.detailid ?? '—'}</td>
                        <td style={tdLeft}>{fmtTanggal(d.tgl_transaksi)}</td>
                        <td style={{ ...tdLeft, whiteSpace: 'normal', maxWidth: 210 }}>{d.program_donasi}</td>
                        <td style={tdRight}>{d.qty ?? '—'}</td>
                        <td style={tdRight}>{fmtRp(Number(d.nominal_donasi || 0))}</td>
                        <td style={tdLeft}>{d.bulan}</td>
                        <td style={tdLeft}>{d.tahun}</td>
                        <td style={tdLeft}>{d.jenis}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <FLabel>Alasan *</FLabel>
          <Textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={3} />
        </div>

        <div style={{ maxWidth: 420 }}>
          <FLabel>Saldo akhir anak lama pindah ke saldo awal anak baru</FLabel>
          <Input
            type="number"
            value={saldoAkhirGanti}
            onChange={e => setSaldoAkhirGanti(e.target.value)}
            style={numInputStyle}
          />
        </div>

        {/* Saldo anak lama — legacy fieldset */}
        <div style={{ border: '1.5px solid #F0C4A0', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#8F3A01', marginBottom: 10 }}>
            Saldo Anak lama — Perhatian, mohon ubah saldo akhir semester anak lama sesuai proses bisnis
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
          }}>
            <div>
              <FLabel>Saldo Awal Jan Jun</FLabel>
              <Input type="number" value={saldoAwalGanjil} onChange={e => setSaldoAwalGanjil(e.target.value)} style={numInputStyle} />
            </div>
            <div>
              <FLabel>Saldo Akhir Jan Jun</FLabel>
              <Input type="number" value={saldoAkhirGanjil} onChange={e => setSaldoAkhirGanjil(e.target.value)} style={numInputStyle} />
            </div>
            <div>
              <FLabel>Saldo Awal Jul Des</FLabel>
              <Input type="number" value={saldoAwalGenap} onChange={e => setSaldoAwalGenap(e.target.value)} style={numInputStyle} />
            </div>
            <div>
              <FLabel>Saldo Akhir Jul Des</FLabel>
              <Input type="number" value={saldoAkhirGenap} onChange={e => setSaldoAkhirGenap(e.target.value)} style={numInputStyle} />
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FDEAEA', color: '#B02020', borderRadius: 10,
            padding: '10px 12px', fontSize: 13, fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Batal</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Memproses...' : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// Placeholder month cells so the header/body column count stays stable while loading.
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

const emptyBoxStyle: React.CSSProperties = {
  fontSize: 12, color: '#7A6055', border: '1px dashed #F0C4A0',
  borderRadius: 10, padding: 12,
};

/** Frozen identity columns of the keuangan grid, in order. */
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
