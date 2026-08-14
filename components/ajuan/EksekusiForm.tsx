'use client';
import { useEffect, useState } from 'react';
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
  } | null;
  opname: {
    saldo_awal_ganjil: number;
    saldo_akhir_ganjil: number;
    saldo_awal_genap: number;
    saldo_akhir_genap: number;
  };
  keuangan: {
    tahun: string;
    months: Array<{ bulan: string; label: string; total: number }>;
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

export function EksekusiForm({ row, onClose, onSuccess }: EksekusiFormProps) {
  const [confirmed, setConfirmed] = useState(false);
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

  const { data: detailRes, isLoading: detailLoading } = useSWR<{ data: DetailPayload }>(
    confirmed ? `/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/detail` : null,
    fetcher,
  );
  const { data: donasiRes } = useSWR<{ data: DonasiPindahRow[] }>(
    confirmed ? `/api/anakjuara/ajuan-ganti-anak/${row.id_ajuan}/donasi-pindah` : null,
    fetcher,
  );

  const detail = detailRes?.data;
  const pairing = detail?.pairing;
  const donasiList = donasiRes?.data ?? [];
  const months = detail?.keuangan.months ?? [];

  useEffect(() => {
    const ok = window.confirm('Sudah Update Saldo Akhir ?');
    if (!ok) {
      onClose();
      return;
    }
    setConfirmed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- confirm once on mount
  }, []);

  // Prefill saldo from opname + pindah_saldo (legacy-like)
  useEffect(() => {
    if (!detail || opnameReady) return;
    const o = detail.opname;
    setSaldoAwalGanjil(String(o.saldo_awal_ganjil ?? 0));
    setSaldoAkhirGanjil(String(o.saldo_akhir_ganjil ?? 0));
    setSaldoAwalGenap(String(o.saldo_awal_genap ?? 0));
    const akhirGenap = Number(o.saldo_akhir_genap ?? 0);
    setSaldoAkhirGenap(String(akhirGenap));
    if (!Number(row.pindah_saldo)) {
      setSaldoAkhirGanti(String(akhirGenap || row.pindah_saldo || 0));
    }
    setOpnameReady(true);
  }, [detail, opnameReady, row.pindah_saldo]);

  const toggleDonasi = (id: number) => {
    setSelectedDonasi(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
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

  if (!confirmed) return null;

  return (
    <Modal title="Ganti Anak" onClose={onClose} maxWidth={920}>
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
              <InfoRow label="ID Anak" value={pairing?.id_anak || row.id_anak} />
              <InfoRow label="Nama Anak" value={pairing?.nama_anak || row.nama_anak_asal} />
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

        {/* Keuangan — fast monthly pivot */}
        <div>
          <div style={{
            background: '#E5EEF8', color: '#1A5FA8', fontSize: 12, fontWeight: 700,
            padding: '8px 10px', borderRadius: '10px 10px 0 0', border: '1px solid #1A5FA830',
            borderBottom: 'none',
          }}>
            Keuangan → scroll kanan untuk donasi bulanan & saldo
          </div>
          <div style={{
            overflowX: 'auto', border: '1px solid #F0C4A0', borderRadius: '0 0 10px 10px',
            background: '#FFFFFF',
          }}>
            <table style={{ borderCollapse: 'collapse', minWidth: 980, width: '100%' }}>
              <thead>
                <tr style={{ background: '#FBF0E8' }}>
                  {['Tahun', 'ID Anak', 'Nama Anak', 'Pendidikan', 'Program', 'Kantor', 'Wilayah',
                    ...months.map(m => m.label)].map(h => (
                    <th key={h} style={{
                      fontSize: 10, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase',
                      padding: '6px 8px', whiteSpace: 'nowrap', textAlign: h.match(/^(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)$/) ? 'right' : 'left',
                      borderBottom: '1px solid #F0C4A0',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdLeft}>{detail?.keuangan.tahun || '—'}</td>
                  <td style={tdLeft}>{pairing?.id_anak || row.id_anak}</td>
                  <td style={tdLeft}>{pairing?.nama_anak || row.nama_anak_asal}</td>
                  <td style={tdLeft}>{pairing?.jenjang_pendidikan || '—'}</td>
                  <td style={tdLeft}>{pairing?.program_donasi || row.program_donasi}</td>
                  <td style={tdLeft}>{pairing?.nama_kantor || row.nama_kantor}</td>
                  <td style={tdLeft}>{pairing?.nama_wilayah || row.nama_wilayah}</td>
                  {months.map(m => (
                    <td key={m.bulan} style={tdRight}>{fmtRp(m.total)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Anak baru + donasi */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <FLabel>Pilih Anak Baru</FLabel>
            <Input
              value={`${row.id_anak_pengganti} | ${row.nama_anak_pengganti}`}
              disabled
            />
          </div>
          <div>
            <FLabel>Saldo akhir anak lama → saldo awal anak baru</FLabel>
            <Input
              type="number"
              value={saldoAkhirGanti}
              onChange={e => setSaldoAkhirGanti(e.target.value)}
              style={numInputStyle}
            />
          </div>
        </div>

        <div>
          <FLabel>Pilih Donasi yang pindah (opsional)</FLabel>
          {donasiList.length === 0 ? (
            <div style={{
              fontSize: 12, color: '#7A6055', border: '1px dashed #F0C4A0',
              borderRadius: 10, padding: 12,
            }}>
              Tidak ada donasi untuk dipindahkan / sedang memuat...
            </div>
          ) : (
            <div style={{
              maxHeight: 140, overflow: 'auto', border: '1px solid #F2EAE3',
              borderRadius: 10, padding: 8,
            }}>
              {donasiList.map(d => (
                <label
                  key={d.id_input_donasi}
                  style={{
                    display: 'flex', gap: 8, alignItems: 'center',
                    fontSize: 12, padding: '5px 4px', cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDonasi.includes(d.id_input_donasi)}
                    onChange={() => toggleDonasi(d.id_input_donasi)}
                  />
                  <span style={{ flex: 1 }}>
                    #{d.id_input_donasi} · {d.bulan}/{d.tahun}
                  </span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {fmtRp(Number(d.nominal_donasi || 0))}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <FLabel>Alasan *</FLabel>
          <Textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={2} />
        </div>

        {/* Saldo anak lama — legacy labels */}
        <div style={{
          border: '1.5px solid #F0C4A0', borderRadius: 12, padding: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#8F3A01', marginBottom: 10 }}>
            Saldo Anak lama (opname)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
          }}>
            <div>
              <FLabel>Saldo Awal Jan–Jun</FLabel>
              <Input type="number" value={saldoAwalGanjil} onChange={e => setSaldoAwalGanjil(e.target.value)} style={numInputStyle} />
            </div>
            <div>
              <FLabel>Saldo Akhir Jan–Jun</FLabel>
              <Input type="number" value={saldoAkhirGanjil} onChange={e => setSaldoAkhirGanjil(e.target.value)} style={numInputStyle} />
            </div>
            <div>
              <FLabel>Saldo Awal Jul–Des</FLabel>
              <Input type="number" value={saldoAwalGenap} onChange={e => setSaldoAwalGenap(e.target.value)} style={numInputStyle} />
            </div>
            <div>
              <FLabel>Saldo Akhir Jul–Des</FLabel>
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

const tdLeft: React.CSSProperties = {
  fontSize: 11, padding: '6px 8px', whiteSpace: 'nowrap', borderBottom: '1px solid #F2EAE3',
  color: '#1A0A00', textAlign: 'left',
};
const tdRight: React.CSSProperties = {
  ...tdLeft,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};
