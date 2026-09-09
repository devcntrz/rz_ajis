'use client';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { useDebouncedValue } from '@/hooks/useAnakPgList';
import { RadioGroup, CheckboxGroup, type RadioOption } from '@/components/survey-pg/SurveyFormFields';
import type { AjisSurveyPg, AjisSurveyPgInput } from '@/types/survey-pg';
import type { AnakPgLookupItem } from '@/types/anak-pg';

interface LockedAnak {
  idAnak: string;
  namaLengkap: string;
  alamat?: string | null;
  jenjangPendidikan?: string | null;
  noKartuKeluarga?: string | null;
}

interface SurveyPgFormProps {
  row?: AjisSurveyPg | null;
  /**
   * Present when the form was opened from the Anak (Pengajuan Beasiswa) list's
   * "Survey" row action: the anak is fixed and the free-text AnakPicker is not
   * rendered at all — only reachable this way, per the intended flow.
   */
  lockedAnak?: LockedAnak | null;
  onClose: () => void;
  onSuccess: () => void;
}

const fieldStyle: React.CSSProperties = { marginBottom: 14 };

const HASIL_OPTIONS = ['Layak', 'Tidak Layak'];

// Legacy "Entry Data Survey" combobox has no fixed legacy option list visible
// in the screenshot — adapted here similarly to AGAMA_OPTIONS in AnakPgForm.tsx
// (a small reasonable set, since a dropdown was requested over free text).
const PEKERJAAN_OPTIONS = [
  'Petani', 'Buruh', 'Pedagang/Wiraswasta', 'Karyawan Swasta',
  'PNS/ASN', 'Nelayan', 'Tidak Bekerja', 'Lainnya',
].map(o => ({ value: o, label: o }));

const YA_TIDAK: RadioOption[] = [{ value: 'Ya', label: 'Ya' }, { value: 'Tidak', label: 'Tidak' }];
const ADA_TIDAK: RadioOption[] = [{ value: 'Ada', label: 'Ada' }, { value: 'Tidak', label: 'Tidak' }];

/** Radio group with a trailing free-text "Lainnya" option — value stored is the
 * plain radio label, or (when "Lainnya" is picked) the typed text itself. */
function initRadioWithLainnya(val: string | null, knownLabels: string[]): { radio: string; other: string } {
  if (!val) return { radio: '', other: '' };
  if (knownLabels.includes(val)) return { radio: val, other: '' };
  return { radio: 'Lainnya', other: val };
}
function composeRadioWithLainnya(radio: string, other: string): string | null {
  if (!radio) return null;
  if (radio === 'Lainnya') return other.trim() || null;
  return radio;
}

const TABS = [
  { id: 'anak', label: 'Data Anak' },
  { id: 'keluarga', label: 'Keluarga' },
  { id: 'ekonomi', label: 'Ekonomi' },
  { id: 'asset', label: 'Asset' },
  { id: 'kesehatan', label: 'Kesehatan' },
  { id: 'ibadah', label: 'Ibadah & Sosial' },
  { id: 'lainnya', label: 'Lainnya' },
  { id: 'survey', label: 'Data Survey' },
] as const;
type TabId = typeof TABS[number]['id'];

/**
 * Read-only child picker for create. Debounced search-as-you-type against
 * GET /api/anakjuara/pg/anak/lookup, which returns a plain array (no `{data}`
 * envelope) — components/ui/SearchSelect.tsx assumes an envelope, so it doesn't
 * fit this endpoint's response shape and this small dedicated picker is used
 * instead.
 */
function AnakPicker({
  idAnak, namaLengkap, onPick,
}: {
  idAnak: string;
  namaLengkap: string;
  onPick: (item: AnakPgLookupItem) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AnakPgLookupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/anakjuara/pg/anak/lookup?q=${encodeURIComponent(debouncedQuery)}`);
        const json: AnakPgLookupItem[] = await res.json();
        if (!cancelled) setOptions(Array.isArray(json) ? json : []);
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [open, debouncedQuery]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#7A6055' }} />
        <Input
          value={open ? query : (namaLengkap ? `${namaLengkap} (${idAnak})` : '')}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={e => e.stopPropagation()}
          placeholder="Ketik nama atau ID anak..."
          style={{ paddingLeft: 30 }}
        />
      </div>
      {open && (
        <ul style={{
          position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, marginTop: 4,
          background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(26,10,0,.12)', maxHeight: 220, overflowY: 'auto',
          listStyle: 'none', margin: '4px 0 0', padding: 4,
        }}>
          {loading && <li style={{ padding: '10px 12px', fontSize: 12, color: '#7A6055' }}>Memuat...</li>}
          {!loading && options.length === 0 && (
            <li style={{ padding: '10px 12px', fontSize: 12, color: '#7A6055' }}>
              {query.trim() ? 'Tidak ditemukan' : 'Ketik untuk mencari'}
            </li>
          )}
          {!loading && options.map(o => (
            <li key={o.id_anak}>
              <button
                type="button"
                onClick={() => { onPick(o); setQuery(''); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', background: 'transparent',
                  padding: '9px 12px', fontSize: 13, color: '#1A0A00', cursor: 'pointer', borderRadius: 6,
                  fontFamily: 'inherit',
                }}
              >
                {o.nama_lengkap} <span style={{ color: '#7A6055', fontSize: 11 }}>({o.id_anak})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SurveyPgForm({ row, lockedAnak, onClose, onSuccess }: SurveyPgFormProps) {
  const isEdit = !!row;
  // Single source of truth for the current step/tab — driven equally by
  // clicking a tab in the desktop strip, the mobile collapsed indicator,
  // and the Kembali/Lanjut footer buttons. There is no separate "step index"
  // state; the index is always derived from `tab`.
  const [tab, setTab] = useState<TabId>('anak');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const stepIndex = TABS.findIndex(t => t.id === tab);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === TABS.length - 1;
  const goToStep = (idx: number) => {
    const clamped = Math.max(0, Math.min(TABS.length - 1, idx));
    setTab(TABS[clamped].id);
  };

  // Data Anak & Petugas
  const [idAnak, setIdAnak] = useState(row?.idAnak ?? lockedAnak?.idAnak ?? '');
  const [namaLengkap, setNamaLengkap] = useState(row?.namaLengkap ?? lockedAnak?.namaLengkap ?? '');
  const [tglSurvey, setTglSurvey] = useState(row?.tglSurvey?.slice(0, 10) ?? '');
  const [petugasSurvey, setPetugasSurvey] = useState(row?.petugasSurvey ?? '');
  const anakLocked = !isEdit && !!lockedAnak;

  // Keluarga
  const [namaKepalaKeluarga, setNamaKepalaKeluarga] = useState(row?.namaKepalaKeluarga ?? '');
  const pendidikanInit = initRadioWithLainnya(row?.pendidikanTerakhirKepalaKeluarga ?? null, ['SD', 'SMP', 'SMA', 'PT']);
  const [pendidikanRadio, setPendidikanRadio] = useState(pendidikanInit.radio);
  const [pendidikanLainnya, setPendidikanLainnya] = useState(pendidikanInit.other);
  const [jmlTanggunganKepalaKeluarga, setJmlTanggunganKepalaKeluarga] = useState(row?.jmlTanggunganKepalaKeluarga?.toString() ?? '');

  // Ekonomi
  const [pekerjaanKepalaKeluarga, setPekerjaanKepalaKeluarga] = useState(row?.pekerjaanKepalaKeluarga ?? '');
  const [rataRataPenghasilanPerbulan, setRataRataPenghasilanPerbulan] = useState(row?.rataRataPenghasilanPerbulan ?? '');
  const [kepemilikanTabungan, setKepemilikanTabungan] = useState(row?.kepemilikanTabungan ?? '');
  const [makan2x, setMakan2x] = useState(row?.makan2x ?? '');

  // Asset
  const [kepemilikanTanah, setKepemilikanTanah] = useState(row?.kepemilikanTanah ?? '');
  const [kepemilikanRumah, setKepemilikanRumah] = useState(row?.kepemilikanRumah ?? '');
  const [kondisiDindingRumah, setKondisiDindingRumah] = useState(row?.kondisiDindingRumah ?? '');
  const [kondisiLantaiRumah, setKondisiLantaiRumah] = useState(row?.kondisiLantaiRumah ?? '');
  const [kepemilikanKendaraan, setKepemilikanKendaraan] = useState(row?.kepemilikanKendaraan ?? '');
  const [kepemilikanBarangElektronik, setKepemilikanBarangElektronik] = useState(row?.kepemilikanBarangElektronik ?? '');
  // "Lainnya" free-text companion for the elektronik checkbox group — parsed
  // back out of the stored comma string (as "Lainnya: <text>") on load.
  const elektronikLainnyaMatch = (row?.kepemilikanBarangElektronik ?? '').split(',').map(s => s.trim()).find(s => s.startsWith('Lainnya:'));
  const [elektronikLainnya, setElektronikLainnya] = useState(elektronikLainnyaMatch ? elektronikLainnyaMatch.replace('Lainnya:', '').trim() : '');

  // Kesehatan
  const sumberAirInit = initRadioWithLainnya(row?.sumberAirBersih ?? null, ['Sumur', 'Sungai', 'PDAM']);
  const [sumberAirRadio, setSumberAirRadio] = useState(sumberAirInit.radio);
  const [sumberAirLainnya, setSumberAirLainnya] = useState(sumberAirInit.other);
  const jambanInit = initRadioWithLainnya(row?.jambanDanSaluranLimbah ?? null, ['Sungai', 'Septiktank']);
  const [jambanRadio, setJambanRadio] = useState(jambanInit.radio);
  const [jambanLainnya, setJambanLainnya] = useState(jambanInit.other);
  const [tempatPembuanganSampah, setTempatPembuanganSampah] = useState(row?.tempatPembuanganSampah ?? '');
  const [terdapatPerokok, setTerdapatPerokok] = useState(row?.terdapatPerokok ?? '');
  const [terdapatKonsumenMiras, setTerdapatKonsumenMiras] = useState(row?.terdapatKonsumenMiras ?? '');
  const [terdapatPersediaanObatP3k, setTerdapatPersediaanObatP3k] = useState(row?.terdapatPersediaanObatP3k ?? '');
  const [makanBuahDanSayurTiapHari, setMakanBuahDanSayurTiapHari] = useState(row?.makanBuahDanSayurTiapHari ?? '');

  // Ibadah & Sosial
  const [shalat5Waktu, setShalat5Waktu] = useState(row?.shalat5Waktu ?? '');
  const [membacaAlquran, setMembacaAlquran] = useState(row?.membacaAlquran ?? '');
  const [majelisTaklim, setMajelisTaklim] = useState(row?.majelisTaklim ?? '');
  const [membacaKoran, setMembacaKoran] = useState(row?.membacaKoran ?? '');
  const orgVal = row?.aktifSebagaiPengurusOrganisasi ?? '';
  const [organisasiRadio, setOrganisasiRadio] = useState(orgVal === 'Tidak' ? 'Tidak' : orgVal ? 'Ya, Sebagai' : '');
  const [organisasiLainnya, setOrganisasiLainnya] = useState(orgVal && orgVal !== 'Tidak' ? orgVal.replace(/^Ya, Sebagai\s*/, '') : '');

  // Lainnya
  const [asnafAnak, setAsnafAnak] = useState(row?.asnafAnak ?? '');
  const [biayaPendidikanSppPerbulan, setBiayaPendidikanSppPerbulan] = useState(row?.biayaPendidikanSppPerbulan ?? '');
  const [bantuanRutinDariLembagaLain, setBantuanRutinDariLembagaLain] = useState(row?.bantuanRutinDariLembagaLain ?? false);
  const [bantuanSumber, setBantuanSumber] = useState('');
  const [jmlBantuanRutinDariLembagaLain, setJmlBantuanRutinDariLembagaLain] = useState(row?.jmlBantuanRutinDariLembagaLain ?? '');
  const [resumeDeskriptif, setResumeDeskriptif] = useState(row?.resumeDeskriptif ?? '');

  // Data Survey
  const [hasilKesimpulanSurvey, setHasilKesimpulanSurvey] = useState(row?.hasilKesimpulanSurvey ?? '');

  const handleSubmit = async () => {
    setError('');
    if (!isEdit && !idAnak.trim()) {
      setError('Anak wajib dipilih.');
      return;
    }

    // "Bantuan Rutin ... dari <sumber>" in the legacy screenshot has no
    // matching column in db/schema/survey.ts (only the boolean flag +
    // jml_bantuan_rutin_dari_lembaga_lain amount exist — no "sumber/asal"
    // text column). Rather than inventing a column/migration, the typed
    // source is folded into resumeDeskriptif as a labeled line.
    let resumeFinal = resumeDeskriptif.trim();
    if (bantuanRutinDariLembagaLain && bantuanSumber.trim()) {
      const line = `Sumber bantuan rutin: ${bantuanSumber.trim()}`;
      resumeFinal = resumeFinal ? `${resumeFinal}\n${line}` : line;
    }

    const body: AjisSurveyPgInput = {
      tglSurvey: tglSurvey || null,
      petugasSurvey: petugasSurvey.trim() || null,

      kepemilikanTanah: kepemilikanTanah.trim() || null,
      kepemilikanRumah: kepemilikanRumah.trim() || null,
      kondisiDindingRumah: kondisiDindingRumah.trim() || null,
      kondisiLantaiRumah: kondisiLantaiRumah.trim() || null,
      kepemilikanKendaraan: kepemilikanKendaraan.trim() || null,
      kepemilikanBarangElektronik: kepemilikanBarangElektronik.trim() || null,
      kepemilikanTabungan: kepemilikanTabungan.trim() || null,
      sumberAirBersih: composeRadioWithLainnya(sumberAirRadio, sumberAirLainnya),
      jambanDanSaluranLimbah: composeRadioWithLainnya(jambanRadio, jambanLainnya),
      tempatPembuanganSampah: tempatPembuanganSampah.trim() || null,
      terdapatPerokok: terdapatPerokok.trim() || null,
      terdapatKonsumenMiras: terdapatKonsumenMiras.trim() || null,
      terdapatPersediaanObatP3k: terdapatPersediaanObatP3k.trim() || null,
      makanBuahDanSayurTiapHari: makanBuahDanSayurTiapHari.trim() || null,
      makan2x: makan2x.trim() || null,

      pekerjaanKepalaKeluarga: pekerjaanKepalaKeluarga.trim() || null,
      namaKepalaKeluarga: namaKepalaKeluarga.trim() || null,
      pendidikanTerakhirKepalaKeluarga: composeRadioWithLainnya(pendidikanRadio, pendidikanLainnya),
      jmlTanggunganKepalaKeluarga: jmlTanggunganKepalaKeluarga ? Number(jmlTanggunganKepalaKeluarga) : null,
      rataRataPenghasilanPerbulan: rataRataPenghasilanPerbulan.trim() || null,
      // NUMERIC columns — kept as strings, never parseFloat'd (CLAUDE.md, lib/pg.ts).
      biayaPendidikanSppPerbulan: biayaPendidikanSppPerbulan?.toString().trim() || null,
      bantuanRutinDariLembagaLain,
      jmlBantuanRutinDariLembagaLain: jmlBantuanRutinDariLembagaLain?.toString().trim() || null,

      shalat5Waktu: shalat5Waktu.trim() || null,
      membacaAlquran: membacaAlquran.trim() || null,
      majelisTaklim: majelisTaklim.trim() || null,
      membacaKoran: membacaKoran.trim() || null,
      aktifSebagaiPengurusOrganisasi: organisasiRadio
        ? (organisasiRadio === 'Tidak' ? 'Tidak' : `Ya, Sebagai${organisasiLainnya.trim() ? ` ${organisasiLainnya.trim()}` : ''}`)
        : null,

      asnafAnak: (asnafAnak as 'yatim' | 'piatu' | 'dhuafa') || null,
      hasilKesimpulanSurvey: hasilKesimpulanSurvey || null,
      resumeDeskriptif: resumeFinal || null,
    };

    if (!isEdit) {
      body.idAnak = idAnak.trim();
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/survey/${row!.idSurvey}` : '/api/anakjuara/pg/survey';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || 'Gagal menyimpan data.';
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(isEdit ? 'Data survey berhasil diperbarui.' : 'Data survey berhasil dibuat.');
      onSuccess();
    } catch {
      const msg = 'Gagal menyimpan data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const kelolaAnak = () => {
    if (anakLocked) {
      return (
        <div style={fieldStyle}>
          <FLabel>Anak</FLabel>
          <Input value={`${namaLengkap} (${idAnak})`} disabled />
        </div>
      );
    }
    if (isEdit) {
      return (
        <div style={fieldStyle}>
          <FLabel>Anak</FLabel>
          <Input value={`${namaLengkap} (${idAnak})`} disabled />
        </div>
      );
    }
    return (
      <div style={fieldStyle}>
        <FLabel>Anak</FLabel>
        <AnakPicker
          idAnak={idAnak}
          namaLengkap={namaLengkap}
          onPick={item => { setIdAnak(item.id_anak); setNamaLengkap(item.nama_lengkap); }}
        />
      </div>
    );
  };

  const renderTab = () => {
    switch (tab) {
      case 'anak':
        return (
          <div>
            {kelolaAnak()}
            <div style={{
              background: '#F2EAE3', borderRadius: 10, padding: 12, fontSize: 13, color: '#1A0A00',
              display: 'grid', gap: 6,
            }}>
              <div><strong>ID Anak:</strong> {idAnak || '-'}</div>
              <div><strong>Nama:</strong> {namaLengkap || '-'}</div>
              <div><strong>Alamat:</strong> {lockedAnak?.alamat ?? row?.alamat ?? '-'}</div>
              <div><strong>Jenjang Pendidikan:</strong> {(lockedAnak?.jenjangPendidikan ?? row?.jenjangPendidikan ?? '-') || '-'}</div>
              <div><strong>No. Kartu Keluarga:</strong> {lockedAnak?.noKartuKeluarga ?? '-'}</div>
            </div>
          </div>
        );

      case 'keluarga':
        return (
          <div>
            <div style={fieldStyle}>
              <FLabel>No Kartu Keluarga</FLabel>
              <Input value={lockedAnak?.noKartuKeluarga ?? ''} disabled placeholder="Tidak tersedia" />
            </div>
            <div style={fieldStyle}>
              <FLabel>Nama Kepala Keluarga</FLabel>
              <Input value={namaKepalaKeluarga} onChange={e => setNamaKepalaKeluarga(e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <FLabel>Pendidikan Terakhir Kepala Keluarga</FLabel>
              <RadioGroup
                name="pendidikan"
                options={[{ value: 'SD', label: 'SD' }, { value: 'SMP', label: 'SMP' }, { value: 'SMA', label: 'SMA' }, { value: 'PT', label: 'PT' }, { value: 'Lainnya', label: 'Lainnya' }]}
                value={pendidikanRadio}
                onChange={setPendidikanRadio}
              />
              {pendidikanRadio === 'Lainnya' && (
                <Input value={pendidikanLainnya} onChange={e => setPendidikanLainnya(e.target.value)} style={{ maxWidth: 240, marginTop: 4 }} />
              )}
            </div>
            <div style={fieldStyle}>
              <FLabel>Jumlah Tanggungan Kepala Keluarga</FLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input type="number" value={jmlTanggunganKepalaKeluarga} onChange={e => setJmlTanggunganKepalaKeluarga(e.target.value)} style={{ maxWidth: 120 }} />
                <span style={{ fontSize: 13, color: '#7A6055' }}>Jiwa</span>
              </div>
            </div>
          </div>
        );

      case 'ekonomi':
        return (
          <div>
            <div style={fieldStyle}>
              <FLabel>Pekerjaan Kepala Keluarga</FLabel>
              <SearchSelect value={pekerjaanKepalaKeluarga} onChange={setPekerjaanKepalaKeluarga} placeholder="Pilih..." options={PEKERJAAN_OPTIONS} />
            </div>
            <div style={fieldStyle}>
              <FLabel>Rata-Rata Penghasilan/bulan</FLabel>
              <RadioGroup
                name="penghasilan"
                options={[
                  { value: 'Dibawah Rp.500.000,-', label: 'Dibawah Rp.500.000,-' },
                  { value: 'Rp.500.000,- s/d Rp.1.500.000,-', label: 'Rp.500.000,- s/d Rp.1.500.000,-' },
                  { value: 'Diatas Rp.1.500.000,-', label: 'Diatas Rp.1.500.000,-' },
                ]}
                value={rataRataPenghasilanPerbulan}
                onChange={setRataRataPenghasilanPerbulan}
              />
            </div>
            <div style={fieldStyle}>
              <FLabel>Kepemilikan Tabungan</FLabel>
              <RadioGroup name="tabungan" options={YA_TIDAK} value={kepemilikanTabungan} onChange={setKepemilikanTabungan} />
            </div>
            <div style={fieldStyle}>
              <FLabel>Makan 2x atau lebih</FLabel>
              <RadioGroup name="makan2x" options={YA_TIDAK} value={makan2x} onChange={setMakan2x} />
            </div>
          </div>
        );

      case 'asset':
        return (
          <div>
            <div className="pg-grid-2">
              <div style={fieldStyle}>
                <FLabel>Kepemilikan Tanah</FLabel>
                <RadioGroup name="tanah" options={YA_TIDAK} value={kepemilikanTanah} onChange={setKepemilikanTanah} />
              </div>
              <div style={fieldStyle}>
                <FLabel>Kepemilikan Rumah</FLabel>
                <RadioGroup
                  name="rumah"
                  options={['Hak Milik', 'Sewa', 'Orang Tua', 'Saudara'].map(v => ({ value: v, label: v }))}
                  value={kepemilikanRumah}
                  onChange={setKepemilikanRumah}
                />
              </div>
            </div>
            <div style={fieldStyle}>
              <FLabel>Kondisi Rumah</FLabel>
              <div className="pg-grid-2">
                <div>
                  <FLabel>Dinding</FLabel>
                  <Input value={kondisiDindingRumah} onChange={e => setKondisiDindingRumah(e.target.value)} />
                </div>
                <div>
                  <FLabel>Lantai</FLabel>
                  <Input value={kondisiLantaiRumah} onChange={e => setKondisiLantaiRumah(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="pg-grid-2">
              <div style={fieldStyle}>
                <FLabel>Kepemilikan Kendaraan</FLabel>
                {/* "Tidak Ada" is exclusive: picking it clears Sepeda/Motor/Mobil and vice versa. */}
                <CheckboxGroup
                  name="kendaraan"
                  options={['Sepeda', 'Motor', 'Mobil'].map(v => ({ value: v, label: v }))}
                  value={kepemilikanKendaraan === 'Tidak Ada' ? '' : kepemilikanKendaraan}
                  onChange={v => setKepemilikanKendaraan(v)}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1A0A00', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={kepemilikanKendaraan === 'Tidak Ada'}
                    onChange={() => setKepemilikanKendaraan(kepemilikanKendaraan === 'Tidak Ada' ? '' : 'Tidak Ada')}
                  />
                  Tidak Ada
                </label>
              </div>
              <div style={fieldStyle}>
                <FLabel>Kepemilikan Barang Elektronik</FLabel>
                <CheckboxGroup
                  name="elektronik"
                  options={['TV', 'Kulkas', 'Handphone'].map(v => ({ value: v, label: v }))}
                  value={kepemilikanBarangElektronik.split(',').map(s => s.trim()).filter(s => s && s !== 'Tidak Ada' && !s.startsWith('Lainnya')).join(', ')}
                  onChange={v => {
                    const base = v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];
                    if (elektronikLainnya.trim()) base.push(`Lainnya: ${elektronikLainnya.trim()}`);
                    setKepemilikanBarangElektronik(base.join(', '));
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1A0A00', cursor: 'pointer', marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={kepemilikanBarangElektronik.split(',').map(s => s.trim()).some(s => s.startsWith('Lainnya'))}
                    onChange={() => {
                      const parts = kepemilikanBarangElektronik.split(',').map(s => s.trim()).filter(Boolean);
                      const hasLainnya = parts.some(s => s.startsWith('Lainnya'));
                      if (hasLainnya) {
                        setElektronikLainnya('');
                        setKepemilikanBarangElektronik(parts.filter(s => !s.startsWith('Lainnya')).join(', '));
                      } else {
                        setKepemilikanBarangElektronik([...parts.filter(s => s !== 'Tidak Ada'), 'Lainnya'].join(', '));
                      }
                    }}
                  />
                  Lainnya
                  {kepemilikanBarangElektronik.split(',').map(s => s.trim()).some(s => s.startsWith('Lainnya')) && (
                    <Input
                      value={elektronikLainnya}
                      onChange={e => {
                        setElektronikLainnya(e.target.value);
                        const parts = kepemilikanBarangElektronik.split(',').map(s => s.trim()).filter(s => s && !s.startsWith('Lainnya'));
                        setKepemilikanBarangElektronik([...parts, `Lainnya: ${e.target.value.trim()}`].join(', '));
                      }}
                      style={{ maxWidth: 160, marginLeft: 4 }}
                    />
                  )}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1A0A00', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={kepemilikanBarangElektronik === 'Tidak Ada'}
                    onChange={() => {
                      if (kepemilikanBarangElektronik === 'Tidak Ada') {
                        setKepemilikanBarangElektronik('');
                      } else {
                        setElektronikLainnya('');
                        setKepemilikanBarangElektronik('Tidak Ada');
                      }
                    }}
                  />
                  Tidak Ada
                </label>
              </div>
            </div>
          </div>
        );

      case 'kesehatan':
        return (
          <div>
            <div className="pg-grid-2">
              <div style={fieldStyle}>
                <FLabel>Sumber Air Bersih</FLabel>
                <RadioGroup
                  name="airBersih"
                  options={[{ value: 'Sumur', label: 'Sumur' }, { value: 'Sungai', label: 'Sungai' }, { value: 'PDAM', label: 'PDAM' }, { value: 'Lainnya', label: 'Lainnya' }]}
                  value={sumberAirRadio}
                  onChange={setSumberAirRadio}
                />
                {sumberAirRadio === 'Lainnya' && (
                  <Input value={sumberAirLainnya} onChange={e => setSumberAirLainnya(e.target.value)} style={{ maxWidth: 240, marginTop: 4 }} />
                )}
              </div>
              <div style={fieldStyle}>
                <FLabel>Jamban dan Saluran Limbah</FLabel>
                <RadioGroup
                  name="jamban"
                  options={[{ value: 'Sungai', label: 'Sungai' }, { value: 'Septiktank', label: 'Septiktank' }, { value: 'Lainnya', label: 'Lainnya' }]}
                  value={jambanRadio}
                  onChange={setJambanRadio}
                />
                {jambanRadio === 'Lainnya' && (
                  <Input value={jambanLainnya} onChange={e => setJambanLainnya(e.target.value)} style={{ maxWidth: 240, marginTop: 4 }} />
                )}
              </div>
            </div>
            <div className="pg-grid-2">
              <div style={fieldStyle}>
                <FLabel>Tempat Pembuangan Sampah</FLabel>
                <RadioGroup
                  name="sampah"
                  options={['TPS', 'Sungai', 'Pekarangan'].map(v => ({ value: v, label: v }))}
                  value={tempatPembuanganSampah}
                  onChange={setTempatPembuanganSampah}
                />
              </div>
              <div style={fieldStyle}>
                <FLabel>Terdapat Perokok</FLabel>
                <RadioGroup name="perokok" options={ADA_TIDAK} value={terdapatPerokok} onChange={setTerdapatPerokok} />
              </div>
            </div>
            <div className="pg-grid-2">
              <div style={fieldStyle}>
                <FLabel>Terdapat Konsumen Miras</FLabel>
                <RadioGroup name="miras" options={ADA_TIDAK} value={terdapatKonsumenMiras} onChange={setTerdapatKonsumenMiras} />
              </div>
              <div style={fieldStyle}>
                <FLabel>Terdapat Persediaan Obat P3K</FLabel>
                <RadioGroup name="p3k" options={ADA_TIDAK} value={terdapatPersediaanObatP3k} onChange={setTerdapatPersediaanObatP3k} />
              </div>
            </div>
            <div style={fieldStyle}>
              <FLabel>Makan Buah dan Sayur Setiap Hari</FLabel>
              <RadioGroup name="buahSayur" options={ADA_TIDAK} value={makanBuahDanSayurTiapHari} onChange={setMakanBuahDanSayurTiapHari} />
            </div>
          </div>
        );

      case 'ibadah':
        return (
          <div>
            <div className="pg-grid-2">
              <div style={fieldStyle}>
                <FLabel>Sholat 5 Waktu</FLabel>
                <RadioGroup
                  name="shalat"
                  options={['Lengkap', 'Kadang-kadang', 'Tidak Pernah'].map(v => ({ value: v, label: v }))}
                  value={shalat5Waktu}
                  onChange={setShalat5Waktu}
                />
              </div>
              <div style={fieldStyle}>
                <FLabel>Membaca Al-Qur&apos;an</FLabel>
                <RadioGroup
                  name="alquran"
                  options={['Lancar', 'Terbata-bata', 'Tidak Bisa'].map(v => ({ value: v, label: v }))}
                  value={membacaAlquran}
                  onChange={setMembacaAlquran}
                />
              </div>
            </div>
            <div className="pg-grid-2">
              <div style={fieldStyle}>
                <FLabel>Majelis Taklim</FLabel>
                <RadioGroup
                  name="majelis"
                  options={['Rutin', 'Tidak Rutin', 'Tidak pernah'].map(v => ({ value: v, label: v }))}
                  value={majelisTaklim}
                  onChange={setMajelisTaklim}
                />
              </div>
              <div style={fieldStyle}>
                <FLabel>Membaca Koran</FLabel>
                <RadioGroup
                  name="koran"
                  options={['Selalu', 'jarang', 'Tidak Pernah'].map(v => ({ value: v, label: v }))}
                  value={membacaKoran}
                  onChange={setMembacaKoran}
                />
              </div>
            </div>
            <div style={fieldStyle}>
              <FLabel>Aktif Sebagai Pengurus Organisasi</FLabel>
              <RadioGroup
                name="organisasi"
                options={[{ value: 'Tidak', label: 'Tidak' }, { value: 'Ya, Sebagai', label: 'Ya, Sebagai' }]}
                value={organisasiRadio}
                onChange={setOrganisasiRadio}
              />
              {organisasiRadio === 'Ya, Sebagai' && (
                <Input value={organisasiLainnya} onChange={e => setOrganisasiLainnya(e.target.value)} style={{ maxWidth: 240, marginTop: 4 }} />
              )}
            </div>
          </div>
        );

      case 'lainnya':
        return (
          <div>
            <div style={fieldStyle}>
              <FLabel>Status Anak</FLabel>
              {/* Legacy screenshot shows only Yatim/Dhuafa, but the CHECK constraint
                  (db/schema/survey.ts) and the prior flat form both support 'piatu'
                  too — kept as a third option so this doesn't regress. */}
              <RadioGroup
                name="asnafAnak"
                options={[{ value: 'yatim', label: 'Yatim' }, { value: 'piatu', label: 'Piatu' }, { value: 'dhuafa', label: 'Dhuafa' }]}
                value={asnafAnak ?? ''}
                onChange={v => setAsnafAnak(v as 'yatim' | 'piatu' | 'dhuafa')}
              />
            </div>
            <div style={fieldStyle}>
              <FLabel>Biaya Pendidikan (SPP) Anak/Bulan</FLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#7A6055' }}>Rp.</span>
                <Input
                  type="number"
                  value={biayaPendidikanSppPerbulan ?? ''}
                  onChange={e => setBiayaPendidikanSppPerbulan(e.target.value)}
                  placeholder="mis. 250000"
                  style={{ maxWidth: 200 }}
                />
              </div>
            </div>
            <div style={fieldStyle}>
              <FLabel>Bantuan Rutin dari Lembaga Formal Lainnya</FLabel>
              <RadioGroup
                name="bantuanRutin"
                options={[{ value: 'Tidak', label: 'Tidak' }, { value: 'Ada', label: 'Ada, dari ___ Sebesar Rp.___' }]}
                value={bantuanRutinDariLembagaLain ? 'Ada' : 'Tidak'}
                onChange={v => setBantuanRutinDariLembagaLain(v === 'Ada')}
              />
              {bantuanRutinDariLembagaLain && (
                <div className="pg-grid-2" style={{ marginTop: 6 }}>
                  <div>
                    <FLabel>Dari (sumber)</FLabel>
                    <Input value={bantuanSumber} onChange={e => setBantuanSumber(e.target.value)} />
                  </div>
                  <div>
                    <FLabel>Sebesar Rp.</FLabel>
                    <Input value={jmlBantuanRutinDariLembagaLain ?? ''} onChange={e => setJmlBantuanRutinDariLembagaLain(e.target.value)} placeholder="mis. 100000" />
                  </div>
                </div>
              )}
            </div>
            <div style={fieldStyle}>
              <FLabel>Resume Diskriptif, Kondisi Calon Penerima Manfaat</FLabel>
              <Textarea value={resumeDeskriptif ?? ''} onChange={e => setResumeDeskriptif(e.target.value)} rows={4} />
            </div>
          </div>
        );

      case 'survey':
      default:
        return (
          <div>
            <div style={fieldStyle}>
              <FLabel>Tanggal Survey</FLabel>
              <Input type="date" value={tglSurvey} onChange={e => setTglSurvey(e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <FLabel>Petugas Survey</FLabel>
              <Input value={petugasSurvey} onChange={e => setPetugasSurvey(e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <FLabel>Hasil Kesimpulan Survey</FLabel>
              <SearchSelect
                value={hasilKesimpulanSurvey ?? ''}
                onChange={setHasilKesimpulanSurvey}
                placeholder="Pilih..."
                options={HASIL_OPTIONS.map(o => ({ value: o, label: o }))}
              />
            </div>
            {hasilKesimpulanSurvey === 'Layak' && (
              <div style={{
                background: '#E5F5ED', color: '#1A7A45', borderRadius: 10,
                padding: '10px 12px', fontSize: 12, fontWeight: 600, marginTop: 6,
              }}>
                Hasil &quot;Layak&quot; akan otomatis mempromosikan anak menjadi Calon Anak Juara (CAJ).
              </div>
            )}
          </div>
        );
    }
  };

  const progressPct = ((stepIndex + 1) / TABS.length) * 100;

  return (
    <Modal title={isEdit ? 'Edit Data Survey' : 'Tambah Data Survey'} onClose={saving ? () => {} : onClose} maxWidth={920}>
      {/* Progress indicator — visible on both desktop and mobile, and on
          mobile it (plus the footer below) is the PRIMARY navigation cue
          since the tab strip is hidden there (app/globals.css). */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A0A00' }}>
            Langkah {stepIndex + 1} dari {TABS.length}: {TABS[stepIndex].label}
          </span>
        </div>
        <div className="survey-progress-track">
          <div className="survey-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="survey-step-dots">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => setTab(t.id)}
              className={`survey-step-dot ${i === stepIndex ? 'is-active' : i < stepIndex ? 'is-done' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {/* Mobile-only collapsed section indicator — deliberately not the
            primary way to navigate; the Kembali/Lanjut footer below is. */}
        <div className="survey-step-collapsed" style={{
          marginTop: 8, fontSize: 12, fontWeight: 700, color: '#7A6055',
          background: '#F2EAE3', borderRadius: 8, padding: '6px 10px',
        }}>
          Bagian: {TABS[stepIndex].label}
        </div>
      </div>

      <div className="survey-tab-layout" style={{ display: 'flex', gap: 20 }}>
        <div className="survey-tab-strip" style={{
          flexDirection: 'column', gap: 4, width: 190, flexShrink: 0,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                background: tab === t.id ? '#BF4E02' : 'transparent',
                color: tab === t.id ? '#FFFFFF' : '#7A6055',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderTab()}

          {error && (
            <div style={{
              background: '#FDEAEA', color: '#B02020', borderRadius: 10,
              padding: '10px 12px', fontSize: 13, fontWeight: 600, marginTop: 6,
            }}>
              {error}
            </div>
          )}

          <div className="survey-step-footer">
            <Btn variant="ghost" onClick={() => goToStep(stepIndex - 1)} disabled={saving || isFirstStep}>Kembali</Btn>
            {isLastStep ? (
              <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
                {saving ? (<><Loader2 size={14} className="ajis-spin" /> Menyimpan...</>) : 'Simpan'}
              </Btn>
            ) : (
              <Btn variant="primary" onClick={() => goToStep(stepIndex + 1)} disabled={saving}>Lanjut</Btn>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
