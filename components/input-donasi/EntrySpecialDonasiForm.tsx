'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { fmtRp, fmtTgl } from '@/lib/utils';
import { useDonaturSearch, useAnakByDonatur, useTransaksiByDonatur } from '@/hooks/useInputDonasi';
import { useTransaksiOptions } from '@/hooks/useTransaksi';
import type { AnakDonasiOption, DonaturOption, TransaksiDonasiOption } from '@/types/input-donasi';

const T = {
  primary: '#BF4E02', primarySoft: '#F0C4A0', primaryPale: '#FBF0E8',
  charcoal: '#1A0A00', gray: '#7A6055', grayLt: '#F2EAE3',
  green: '#1A7A45', greenPale: '#E5F5ED', red: '#B02020', redPale: '#FDEAEA',
};

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function EntrySpecialDonasiForm({ onClose, onSuccess }: Props) {
  const [donaturQ, setDonaturQ] = useState('');
  const [donatur, setDonatur] = useState<DonaturOption | null>(null);
  const [anakQ, setAnakQ] = useState('');
  const [anak, setAnak] = useState<AnakDonasiOption | null>(null);
  const [selected, setSelected] = useState<TransaksiDonasiOption[]>([]);
  const [idProgram, setIdProgram] = useState('');
  const [tglTransaksi, setTglTransaksi] = useState(today());
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [saving, setSaving] = useState(false);

  const donaturResults = useDonaturSearch(donatur ? '' : donaturQ);
  const anakResults = useAnakByDonatur(donatur?.did ?? '', anakQ);
  const transaksiResults = useTransaksiByDonatur(donatur?.did ?? '');
  const { program, loading: programLoading } = useTransaksiOptions();
  const programOptions = useMemo(
    () => program.map(p => ({ value: String(p.id_program), label: `${p.nama_program} — ${fmtRp(p.harga_program)}` })),
    [program],
  );
  const namaProgram = program.find(p => String(p.id_program) === idProgram)?.nama_program ?? '';

  const pickDonatur = (d: DonaturOption) => {
    setDonatur(d); setDonaturQ(d.nama_lengkap); setAnak(null); setSelected([]);
  };
  const pickAnak = (a: AnakDonasiOption) => { setAnak(a); setAnakQ(a.nama_anak); };

  const toggle = (t: TransaksiDonasiOption) => {
    setSelected(prev => prev.some(s => s.transid === t.transid && s.detailid === t.detailid)
      ? prev.filter(s => !(s.transid === t.transid && s.detailid === t.detailid))
      : [...prev, t]);
  };

  const totalTerpilih = useMemo(
    () => selected.reduce((s, t) => s + Number(t.perkiraan_rp), 0),
    [selected],
  );
  const selectedProgram = program.find(p => p.nama_program === namaProgram);
  const target = Number(selectedProgram?.harga_program ?? 0);
  const selisih = target - totalTerpilih;
  const balanced = selected.length >= 2 && target > 0 && selisih === 0;

  const save = async () => {
    if (!donatur || !anak) { toast.error('Lengkapi Donatur dan Anak terlebih dahulu.'); return; }
    if (!balanced) { toast.error('Total transaksi terpilih harus persis sama dengan harga program.'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/input-donasi/special', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did:                donatur.did,
          idAnak:              anak.id_anak,
          idPemasanganBaru:    anak.id_pemasangan_baru,
          idProgram:           String(anak.id_program),
          programDonasi:       namaProgram,
          kantorId:            anak.kantor_id,
          idWilayahPembinaan:  anak.id_wilayah_pembinaan,
          items:               selected.map(s => ({ transid: s.transid, detailid: s.detailid })),
          tglTransaksi,
          bulan: Number(bulan),
          tahun: Number(tahun),
          nominalDonasi: target,
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menyimpan Entry Special.'); return; }
      toast.success(json.message || 'Entry Special tersimpan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  const comboStyle: React.CSSProperties = { position: 'relative' };
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
    background: '#FFFFFF', border: `1.5px solid ${T.primarySoft}`, borderRadius: 8,
    maxHeight: 200, overflowY: 'auto', marginTop: 4,
    boxShadow: '0 10px 24px -8px rgba(26,10,0,.25)',
  };
  const optionStyle: React.CSSProperties = {
    padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: `1px solid ${T.grayLt}`,
  };

  return (
    <Modal title="Entry Special — Input Donasi (Cicilan)" onClose={onClose} maxWidth={680}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: T.gray, margin: 0 }}>
          Gabungkan beberapa transaksi cicilan donatur ini menjadi satu entri donasi,
          ketika totalnya persis sama dengan harga satu program.
        </p>

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

        <div>
          <FLabel>Program (harga target)</FLabel>
          <SearchSelect
            value={idProgram}
            onChange={setIdProgram}
            options={programOptions}
            disabled={programLoading}
            clearable
            limit={Math.max(programOptions.length, 1)}
          />
        </div>

        <div>
          <FLabel>Transaksi Cicilan (pilih ≥ 2, jumlah harus pas)</FLabel>
          {!donatur && <div style={{ fontSize: 12, color: T.gray }}>Pilih donatur terlebih dahulu.</div>}
          {donatur && transaksiResults.loading && <div style={{ fontSize: 12, color: T.gray }}>Memuat…</div>}
          {donatur && !transaksiResults.loading && transaksiResults.rows.length === 0 && (
            <div style={{ fontSize: 12, color: T.gray }}>Tidak ada transaksi cicilan yang layak dibebani.</div>
          )}
          {donatur && transaksiResults.rows.length > 0 && (
            <div style={{ border: `1.5px solid ${T.primarySoft}`, borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
              {transaksiResults.rows.map(t => {
                const checked = selected.some(s => s.transid === t.transid && s.detailid === t.detailid);
                return (
                  <div
                    key={`${t.transid}-${t.detailid}`}
                    onClick={() => toggle(t)}
                    style={{
                      ...optionStyle,
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: checked ? T.primaryPale : undefined,
                      borderLeft: checked ? `3px solid ${T.primary}` : '3px solid transparent',
                    }}
                  >
                    <input type="checkbox" checked={checked} readOnly style={{ accentColor: T.primary }} />
                    <div>
                      <strong>{t.transid}·{t.detailid}</strong> — {t.nama_program}
                      <div style={{ fontSize: 11, color: T.gray }}>
                        {fmtTgl(t.tgl_transaksi)} · Nominal {fmtRp(t.perkiraan_rp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center',
          background: balanced ? T.greenPale : T.redPale,
          color: balanced ? T.green : T.red,
          borderRadius: 12, padding: '11px 14px', fontSize: 13, fontWeight: 700,
        }}>
          <span>Total terpilih: {fmtRp(totalTerpilih)}</span>
          <span>Harga program: {fmtRp(target)}</span>
          <span>Selisih: {fmtRp(selisih)}</span>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={saving || !balanced}>
            {saving ? 'Menyimpan…' : 'Simpan Entry Special'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
