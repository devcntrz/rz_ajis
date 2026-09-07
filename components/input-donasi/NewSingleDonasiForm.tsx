'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { fmtRp, fmtTgl } from '@/lib/utils';
import { useDonaturSearch, useAnakByDonatur, useTransaksiByDonatur } from '@/hooks/useInputDonasi';
import type { AnakDonasiOption, DonaturOption, TransaksiDonasiOption } from '@/types/input-donasi';

const T = {
  primary: '#BF4E02', primarySoft: '#F0C4A0', primaryPale: '#FBF0E8',
  charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3',
};

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function NewSingleDonasiForm({ onClose, onSuccess }: Props) {
  const [donaturQ, setDonaturQ] = useState('');
  const [donatur, setDonatur] = useState<DonaturOption | null>(null);
  const [anakQ, setAnakQ] = useState('');
  const [anak, setAnak] = useState<AnakDonasiOption | null>(null);
  const [transaksi, setTransaksi] = useState<TransaksiDonasiOption | null>(null);
  const [tglTransaksi, setTglTransaksi] = useState(today());
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [nominal, setNominal] = useState('');
  const [saving, setSaving] = useState(false);

  const donaturResults = useDonaturSearch(donatur ? '' : donaturQ);
  const anakResults = useAnakByDonatur(donatur?.did ?? '', anakQ);
  const transaksiResults = useTransaksiByDonatur(donatur?.did ?? '');

  const pickDonatur = (d: DonaturOption) => {
    setDonatur(d);
    setDonaturQ(d.nama_lengkap);
    setAnak(null);
    setTransaksi(null);
  };

  const pickAnak = (a: AnakDonasiOption) => {
    setAnak(a);
    setAnakQ(a.nama_anak);
  };

  const reset = () => {
    setDonatur(null); setDonaturQ(''); setAnak(null); setAnakQ('');
    setTransaksi(null); setNominal('');
  };

  const save = async () => {
    if (!donatur || !anak || !transaksi) {
      toast.error('Lengkapi Donatur, Anak, dan Transaksi terlebih dahulu.');
      return;
    }
    const nominalNum = Number(nominal);
    if (!nominalNum || nominalNum <= 0) {
      toast.error('Nominal harus lebih dari 0.');
      return;
    }
    const sisa = Number(transaksi.perkiraan_rp) - Number(transaksi.total_input_donasi);
    if (nominalNum > sisa + 0.01) {
      toast.error(`Nominal melebihi sisa transaksi (${fmtRp(sisa)}).`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/input-donasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did:                donatur.did,
          idAnak:              anak.id_anak,
          idPemasanganBaru:    anak.id_pemasangan_baru,
          idProgram:           String(anak.id_program),
          programDonasi:       anak.program_donasi,
          kantorId:            anak.kantor_id,
          idWilayahPembinaan:  anak.id_wilayah_pembinaan,
          transid:             transaksi.transid,
          detailid:            transaksi.detailid,
          tglTransaksi,
          bulan:               Number(bulan),
          tahun:               Number(tahun),
          qty:                 1,
          pilihanDonasi:       nominalNum,
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menyimpan donasi.'); return; }
      toast.success(json.message || 'Donasi tersimpan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  const comboStyle: React.CSSProperties = {
    position: 'relative',
  };
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
    background: '#FFFFFF', border: `1.5px solid ${T.primarySoft}`, borderRadius: 8,
    maxHeight: 220, overflowY: 'auto', marginTop: 4,
    boxShadow: '0 10px 24px -8px rgba(26,10,0,.25)',
  };
  const optionStyle: React.CSSProperties = {
    padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: `1px solid ${T.grayLt}`,
  };

  return (
    <Modal title="New Single — Input Donasi" onClose={onClose} maxWidth={620}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Donatur */}
        <div style={comboStyle}>
          <FLabel>Donatur</FLabel>
          <Input
            value={donaturQ}
            onChange={e => { setDonaturQ(e.target.value); setDonatur(null); }}
            placeholder="Ketik nama atau ID donatur…"
          />
          {!donatur && donaturQ.trim().length >= 2 && (
            <div style={dropdownStyle}>
              {donaturResults.loading && <div style={optionStyle}>Mencari…</div>}
              {!donaturResults.loading && donaturResults.rows.length === 0 && (
                <div style={optionStyle}>Tidak ditemukan.</div>
              )}
              {donaturResults.rows.map(d => (
                <div key={d.did} style={optionStyle} onClick={() => pickDonatur(d)}>
                  <strong>{d.nama_lengkap}</strong>
                  <div style={{ fontSize: 11, color: T.gray }}>{d.did} · {d.kantor || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anak */}
        <div style={comboStyle}>
          <FLabel>Anak</FLabel>
          <Input
            value={anakQ}
            onChange={e => { setAnakQ(e.target.value); setAnak(null); }}
            placeholder={donatur ? 'Ketik nama atau ID anak…' : 'Pilih donatur terlebih dahulu'}
            disabled={!donatur}
          />
          {donatur && !anak && (
            <div style={dropdownStyle}>
              {anakResults.loading && <div style={optionStyle}>Mencari…</div>}
              {!anakResults.loading && anakResults.rows.length === 0 && (
                <div style={optionStyle}>Tidak ada anak terpasang untuk donatur ini.</div>
              )}
              {anakResults.rows.map(a => (
                <div key={a.id_anak} style={optionStyle} onClick={() => pickAnak(a)}>
                  <strong>{a.nama_anak}</strong>
                  <div style={{ fontSize: 11, color: T.gray }}>
                    {a.id_anak} · {a.program_donasi} · {a.nama_kantor}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {anak && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            background: T.primaryPale, borderRadius: 10, padding: 12, fontSize: 12,
          }}>
            <div><span style={{ color: T.gray }}>ID Pemasangan:</span> {anak.id_pemasangan_baru}</div>
            <div><span style={{ color: T.gray }}>ID Program:</span> {anak.id_program}</div>
            <div><span style={{ color: T.gray }}>Kantor:</span> {anak.nama_kantor}</div>
            <div><span style={{ color: T.gray }}>Wilayah:</span> {anak.nama_wilayah}</div>
          </div>
        )}

        {/* Transaksi */}
        <div>
          <FLabel>Transaksi (cicilan, sudah disetujui salur)</FLabel>
          {!donatur && <div style={{ fontSize: 12, color: T.gray }}>Pilih donatur terlebih dahulu.</div>}
          {donatur && transaksiResults.loading && <div style={{ fontSize: 12, color: T.gray }}>Memuat…</div>}
          {donatur && !transaksiResults.loading && transaksiResults.rows.length === 0 && (
            <div style={{ fontSize: 12, color: T.gray }}>Tidak ada transaksi cicilan yang layak dibebani.</div>
          )}
          {donatur && transaksiResults.rows.length > 0 && (
            <div style={{ border: `1.5px solid ${T.primarySoft}`, borderRadius: 8, maxHeight: 160, overflowY: 'auto' }}>
              {transaksiResults.rows.map(t => {
                const sisa = Number(t.perkiraan_rp) - Number(t.total_input_donasi);
                const selected = transaksi?.transid === t.transid && transaksi?.detailid === t.detailid;
                return (
                  <div
                    key={`${t.transid}-${t.detailid}`}
                    onClick={() => setTransaksi(t)}
                    style={{
                      ...optionStyle,
                      background: selected ? T.primaryPale : undefined,
                      borderLeft: selected ? `3px solid ${T.primary}` : '3px solid transparent',
                    }}
                  >
                    <strong>{t.transid}·{t.detailid}</strong> — {t.nama_program}
                    <div style={{ fontSize: 11, color: T.gray }}>
                      {fmtTgl(t.tgl_transaksi)} · Perkiraan {fmtRp(t.perkiraan_rp)} · Sisa {fmtRp(sisa)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <FLabel>Tgl Transaksi</FLabel>
            <Input type="date" value={tglTransaksi} onChange={e => setTglTransaksi(e.target.value)} />
          </div>
          <div>
            <FLabel>Bulan Salur</FLabel>
            <Input type="number" value={bulan} onChange={e => setBulan(e.target.value)} />
          </div>
          <div>
            <FLabel>Tahun Salur</FLabel>
            <Input type="number" value={tahun} onChange={e => setTahun(e.target.value)} />
          </div>
        </div>

        <div>
          <FLabel>Nominal</FLabel>
          <Input type="number" value={nominal} onChange={e => setNominal(e.target.value)} placeholder="0" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="ghost" onClick={reset}>Reset Pilihan</Btn>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
