'use client';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea } from '@/components/ui/Input';
import { KeuanganGrid } from '@/components/keuangan/KeuanganGrid';
import type { MonthCell, SemesterBlock } from '@/lib/keuangan';
import type { AjuanGantiAnak, DonasiPindahRow } from '@/types/ajuan';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface EksekusiFormProps {
  row: AjuanGantiAnak;
  onClose: () => void;
  onSuccess: () => void;
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
        const msg = json.error || 'Gagal mengeksekusi.';
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(
        `Eksekusi berhasil. ${row.nama_anak_asal} diganti oleh ${row.nama_anak_pengganti}.`,
      );
      onSuccess();
    } catch {
      const msg = 'Gagal mengeksekusi.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const idAnak = pairing?.id_anak || row.id_anak;
  const namaAnak = pairing?.nama_anak || row.nama_anak_asal;

  return (
    // Execution writes 11 tables; closing or editing mid-flight would leave the
    // operator unsure whether it landed. Block the form until the request settles.
    <Modal title="Ganti Anak" onClose={saving ? () => {} : onClose} maxWidth={1040}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        pointerEvents: saving ? 'none' : undefined,
        opacity: saving ? 0.6 : 1,
        transition: 'opacity .15s',
      }}>
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

        <KeuanganGrid
          rows={[{
            key: row.id_pemasangan_baru || String(row.id_ajuan),
            tahun: detail?.keuangan?.tahun || '—',
            id_anak: idAnak,
            nama_anak: namaAnak,
            pivot: detail?.keuangan,
          }]}
        />

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

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center',
          // Kept interactive so the disabled state is what stops the user, not a dead zone.
          pointerEvents: 'auto',
        }}>
          {saving && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginRight: 'auto', fontSize: 12, fontWeight: 600, color: '#8F3A01',
            }}>
              <Loader2 size={15} className="ajis-spin" />
              Memproses eksekusi — jangan tutup jendela ini...
            </span>
          )}
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Batal</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={14} className="ajis-spin" />
                Memproses...
              </>
            ) : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/* Cell styles for the "Pilih Donasi yg pindah" grid below. The finance pivot keeps
   its own copies inside KeuanganGrid, which owns that table. */
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
