'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { Badge } from '@/components/ui/Badge';
import type { AnakPg, AnakPgInput } from '@/types/anak-pg';

interface AnakPgFormProps {
  row?: AnakPg | null;
  onClose: () => void;
  onSuccess: () => void;
}

const JENJANG_OPTIONS = ['sd', 'smp', 'sma', 'smk', 'mi', 'mts', 'ma', 'pt'];
const STATUS_AJ_OPTIONS = [
  { value: 'caj', label: 'Calon Anak Juara' },
  { value: 'aj', label: 'Anak Juara' },
  { value: 'non', label: 'Non Aktif' },
];
// Legacy PengajuanBeasiswaDeni.html leaves `agama` a free-text input with no
// fixed option list — adapted here to Indonesia's 6 officially recognized
// religions, since a dropdown was explicitly requested.
const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
  .map(a => ({ value: a, label: a }));
// Admin-form asnaf combobox (PengajuanBeasiswaDeni.html) — the richer Title
// Case list, matching this app's admin-facing usage.
const ASNAF_OPTIONS = [
  'Fakir', 'Miskin', 'Amil', 'Muallaf', 'Gharimin',
  'Fii Sabilillah', 'Ibnu Sabil', 'Hamba Sahaya',
].map(a => ({ value: a, label: a }));
// Union of admin ('Lengkap') and user ('Dhuafa') status_ortu comboboxes —
// both forms' values appear in real legacy data.
const STATUS_ORTU_OPTIONS = ['Lengkap', 'Yatim', 'Piatu', 'Yatim Piatu', 'Dhuafa']
  .map(s => ({ value: s, label: s }));

const sectionStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 800, color: '#8F3A01',
  margin: '18px 0 10px', paddingTop: 14, borderTop: '1px solid #F2EAE3',
};
const firstSectionStyle: React.CSSProperties = { ...sectionStyle, marginTop: 0, paddingTop: 0, borderTop: 'none' };
const fieldStyle: React.CSSProperties = { marginBottom: 12 };

export function AnakPgForm({ row, onClose, onSuccess }: AnakPgFormProps) {
  const isEdit = !!row;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Data Anak
  // Server-generated on create (see generateIdAnak in the POST route handler,
  // porting the legacy GenerateID_anak() PHP algorithm); read-only here, shown
  // only in edit mode since create mode has no value yet.
  const [idAnak] = useState(row?.idAnak ?? '');
  const [nik, setNik] = useState(row?.nik ?? '');
  const [namaLengkap, setNamaLengkap] = useState(row?.namaLengkap ?? '');
  const [namaPanggilan, setNamaPanggilan] = useState(row?.namaPanggilan ?? '');
  const [jnsKel, setJnsKel] = useState(row?.jnsKel ?? '');
  const [tempatLahir, setTempatLahir] = useState(row?.tempatLahir ?? '');
  const [tglLahir, setTglLahir] = useState(row?.tglLahir?.slice(0, 10) ?? '');
  const [agama, setAgama] = useState(row?.agama ?? '');
  const [asnaf, setAsnaf] = useState(row?.asnaf ?? '');
  const [statusOrtu, setStatusOrtu] = useState(row?.statusOrtu ?? '');
  const [telp, setTelp] = useState(row?.telpYangBisaDihubungi ?? '');

  // Alamat
  const [alamat, setAlamat] = useState(row?.alamat ?? '');
  const [namaPropinsi, setNamaPropinsi] = useState(row?.namaPropinsi ?? '');
  const [namaKabupaten, setNamaKabupaten] = useState(row?.namaKabupaten ?? '');
  const [namaKecamatan, setNamaKecamatan] = useState(row?.namaKecamatan ?? '');
  const [namaDesa, setNamaDesa] = useState(row?.namaDesa ?? '');
  // Propinsi -> Kabupaten -> Kecamatan -> Desa cascade codes. Not columns on
  // ajis_anak (only the denormalized nama_* text is), so they only drive the
  // cascade + label lookup; an existing row has no known code for its legacy
  // denormalized text, so the cascade starts empty in edit mode.
  const [propid, setPropid] = useState('');
  const [kabid, setKabid] = useState('');
  const [camatid, setCamatid] = useState('');
  const [desaid, setDesaid] = useState('');
  const hasExistingAlamatText = isEdit && (namaPropinsi || namaKabupaten || namaKecamatan || namaDesa);

  // Sekolah
  const [jenjangPendidikan, setJenjangPendidikan] = useState(row?.jenjangPendidikan ?? '');
  const [kelas, setKelas] = useState(row?.kelas ?? '');
  const [namaSekolah, setNamaSekolah] = useState(row?.namaSekolah ?? '');
  const [alamatSekolah, setAlamatSekolah] = useState(row?.alamatSekolah ?? '');
  const [jurusan, setJurusan] = useState(row?.jurusan ?? '');

  // Orang Tua / Wali
  const [namaLengkapAyah, setNamaLengkapAyah] = useState(row?.namaLengkapAyah ?? '');
  const [pekerjaanAyah, setPekerjaanAyah] = useState(row?.pekerjaanAyah ?? '');
  const [penghasilanRataRataAyah, setPenghasilanRataRataAyah] = useState(row?.penghasilanRataRataAyah ?? '');
  const [namaLengkapIbu, setNamaLengkapIbu] = useState(row?.namaLengkapIbu ?? '');
  const [pekerjaanIbu, setPekerjaanIbu] = useState(row?.pekerjaanIbu ?? '');
  const [penghasilanRataRataIbu, setPenghasilanRataRataIbu] = useState(row?.penghasilanRataRataIbu ?? '');
  const [namaLengkapWali, setNamaLengkapWali] = useState(row?.namaLengkapWali ?? '');
  const [hubunganKerabat, setHubunganKerabat] = useState(row?.hubunganKerabat ?? '');

  // Bank
  const [noRekening, setNoRekening] = useState(row?.noRekening ?? '');
  const [pemilikRekening, setPemilikRekening] = useState(row?.pemilikRekening ?? '');
  const [namaBank, setNamaBank] = useState(row?.namaBank ?? '');

  // Kantor / Wilayah
  const [kantorId, setKantorId] = useState(row?.kantorId ?? '');
  const [namaKantor, setNamaKantor] = useState(row?.namaKantor ?? '');
  const [idWilayahPembinaan, setIdWilayahPembinaan] = useState(row?.idWilayahPembinaan?.toString() ?? '');
  const [namaWilayah, setNamaWilayah] = useState(row?.namaWilayah ?? '');
  // Derived by the survey flow (see below) — read-only, never submitted here.
  const [statusAnakJuara] = useState(row?.statusAnakJuara ?? '');

  const handleSubmit = async () => {
    setError('');
    if (!namaLengkap.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    const body: AnakPgInput = {
      namaLengkap: namaLengkap.trim(),
      nik: nik.trim() || null,
      namaPanggilan: namaPanggilan.trim() || null,
      jnsKel: (jnsKel || null) as AnakPgInput['jnsKel'],
      tempatLahir: tempatLahir.trim() || null,
      tglLahir: tglLahir || null,
      agama: agama.trim() || null,
      asnaf: asnaf.trim() || null,
      statusOrtu: statusOrtu.trim() || null,
      telpYangBisaDihubungi: telp.trim() || null,

      alamat: alamat.trim() || null,
      namaPropinsi: namaPropinsi.trim() || null,
      namaKabupaten: namaKabupaten.trim() || null,
      namaKecamatan: namaKecamatan.trim() || null,
      namaDesa: namaDesa.trim() || null,

      jenjangPendidikan: jenjangPendidikan || null,
      kelas: kelas.trim() || null,
      namaSekolah: namaSekolah.trim() || null,
      alamatSekolah: alamatSekolah.trim() || null,
      jurusan: jurusan.trim() || null,

      namaLengkapAyah: namaLengkapAyah.trim() || null,
      pekerjaanAyah: pekerjaanAyah.trim() || null,
      penghasilanRataRataAyah: penghasilanRataRataAyah || null,
      namaLengkapIbu: namaLengkapIbu.trim() || null,
      pekerjaanIbu: pekerjaanIbu.trim() || null,
      penghasilanRataRataIbu: penghasilanRataRataIbu || null,
      namaLengkapWali: namaLengkapWali.trim() || null,
      hubunganKerabat: hubunganKerabat.trim() || null,

      noRekening: noRekening.trim() || null,
      pemilikRekening: pemilikRekening.trim() || null,
      namaBank: namaBank.trim() || null,

      kantorId: kantorId.trim() || null,
      namaKantor: namaKantor.trim() || null,
      idWilayahPembinaan: idWilayahPembinaan ? Number(idWilayahPembinaan) : null,
      namaWilayah: namaWilayah.trim() || null,
    };

    setSaving(true);
    try {
      const url = isEdit ? `/api/anakjuara/pg/anak/${encodeURIComponent(row!.idAnak)}` : '/api/anakjuara/pg/anak';
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
      toast.success(isEdit ? 'Data anak berhasil diperbarui.' : 'Data anak berhasil dibuat.');
      onSuccess();
    } catch {
      const msg = 'Gagal menyimpan data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Pengajuan Beasiswa' : 'Tambah Pengajuan Beasiswa'} onClose={saving ? () => {} : onClose} maxWidth={920}>
      <div>
        <div style={firstSectionStyle}>Kantor / Wilayah</div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Kantor</FLabel>
            <SearchSelect
              value={kantorId}
              onChange={(oid) => { setKantorId(oid); setIdWilayahPembinaan(''); setNamaWilayah(''); }}
              onLabelChange={setNamaKantor}
              resolvedLabel={namaKantor || undefined}
              fetchUrl="/api/anakjuara/pg/kantor/lookup"
              mapRow={r => ({ value: String(r.oid), label: String(r.kantor ?? r.oid ?? '') })}
              placeholder="Cari kantor..."
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Wilayah Pembinaan</FLabel>
            <SearchSelect
              key={kantorId}
              value={idWilayahPembinaan}
              onChange={setIdWilayahPembinaan}
              onLabelChange={setNamaWilayah}
              resolvedLabel={namaWilayah || undefined}
              fetchUrl={`/api/anakjuara/pg/wilayah/lookup${kantorId ? `?kantor_id=${encodeURIComponent(kantorId)}` : ''}`}
              mapRow={r => ({ value: String(r.idWilayahPembinaan), label: String(r.namaWilayah ?? '') })}
              placeholder={kantorId ? 'Cari wilayah...' : 'Pilih kantor dahulu'}
              disabled={!kantorId}
              limit={20}
              clearable
            />
          </div>
        </div>
        {/* Status Anak Juara is derived, not editable: it starts empty and is
            set to 'caj' automatically when a linked Data Survey's hasil_kesimpulan_survey
            becomes 'Layak' (see the survey POST/PUT transaction). Shown read-only
            here purely as information — never submitted from this form. */}
        {isEdit && statusAnakJuara && (
          <div style={{ ...fieldStyle, marginTop: -4 }}>
            <FLabel>Status Anak Juara</FLabel>
            <div>
              <Badge
                label={STATUS_AJ_OPTIONS.find(o => o.value === statusAnakJuara)?.label ?? statusAnakJuara}
                color="#1A5FA8"
                bg="#E5EEF8"
              />
            </div>
          </div>
        )}

        <div style={sectionStyle}>Data Anak</div>
        <div className="pg-grid-3">
          {isEdit && (
            <div style={fieldStyle}>
              <FLabel>ID Anak</FLabel>
              <Input value={idAnak} disabled />
            </div>
          )}
          <div style={fieldStyle}>
            <FLabel>NIK</FLabel>
            <Input value={nik} onChange={e => setNik(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>No. Telp</FLabel>
            <Input value={telp} onChange={e => setTelp(e.target.value)} />
          </div>
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Nama Lengkap</FLabel>
            <Input value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Nama Panggilan</FLabel>
            <Input value={namaPanggilan} onChange={e => setNamaPanggilan(e.target.value)} />
          </div>
        </div>
        <div className="pg-grid-3">
          <div style={fieldStyle}>
            <FLabel>Jenis Kelamin</FLabel>
            <SearchSelect
              value={jnsKel}
              onChange={setJnsKel}
              placeholder="Pilih..."
              options={[{ value: 'l', label: 'Laki-laki' }, { value: 'p', label: 'Perempuan' }]}
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Tempat Lahir</FLabel>
            <Input value={tempatLahir} onChange={e => setTempatLahir(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Tanggal Lahir</FLabel>
            <Input type="date" value={tglLahir} onChange={e => setTglLahir(e.target.value)} />
          </div>
        </div>
        <div className="pg-grid-3">
          <div style={fieldStyle}>
            <FLabel>Agama</FLabel>
            <SearchSelect
              value={agama}
              onChange={setAgama}
              placeholder="Pilih..."
              options={AGAMA_OPTIONS}
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Asnaf</FLabel>
            <SearchSelect
              value={asnaf}
              onChange={setAsnaf}
              placeholder="Pilih..."
              options={ASNAF_OPTIONS}
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Status Ortu</FLabel>
            <SearchSelect
              value={statusOrtu}
              onChange={setStatusOrtu}
              placeholder="Pilih..."
              options={STATUS_ORTU_OPTIONS}
            />
          </div>
        </div>

        <div style={sectionStyle}>Alamat</div>
        <div style={fieldStyle}>
          <FLabel>Alamat</FLabel>
          <Textarea value={alamat} onChange={e => setAlamat(e.target.value)} rows={2} />
        </div>
        {hasExistingAlamatText && (
          <div style={{ ...fieldStyle, fontSize: 12, color: '#7A6055' }}>
            Saat ini: {[namaPropinsi, namaKabupaten, namaKecamatan, namaDesa].filter(Boolean).join(', ') || '-'}
          </div>
        )}
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Propinsi</FLabel>
            <SearchSelect
              value={propid}
              onChange={(v) => { setPropid(v); setKabid(''); setCamatid(''); setDesaid(''); }}
              onLabelChange={setNamaPropinsi}
              fetchUrl="/api/anakjuara/pg/ref/propinsi/lookup"
              mapRow={r => ({ value: String(r.propid), label: String(r.propinsi ?? '') })}
              placeholder="Cari propinsi..."
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Kabupaten/Kota</FLabel>
            <SearchSelect
              key={propid}
              value={kabid}
              onChange={(v) => { setKabid(v); setCamatid(''); setDesaid(''); }}
              onLabelChange={setNamaKabupaten}
              fetchUrl={`/api/anakjuara/pg/ref/kabupaten/lookup${propid ? `?propid=${encodeURIComponent(propid)}` : ''}`}
              mapRow={r => ({ value: String(r.kabid), label: String(r.kabupaten ?? '') })}
              placeholder={propid ? 'Cari kabupaten...' : 'Pilih propinsi dahulu'}
              disabled={!propid}
              limit={20}
              clearable
            />
          </div>
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Kecamatan</FLabel>
            <SearchSelect
              key={kabid}
              value={camatid}
              onChange={(v) => { setCamatid(v); setDesaid(''); }}
              onLabelChange={setNamaKecamatan}
              fetchUrl={`/api/anakjuara/pg/ref/kecamatan/lookup${kabid ? `?kabid=${encodeURIComponent(kabid)}` : ''}`}
              mapRow={r => ({ value: String(r.camatid), label: String(r.namaKecamatan ?? '') })}
              placeholder={kabid ? 'Cari kecamatan...' : 'Pilih kabupaten dahulu'}
              disabled={!kabid}
              limit={20}
              clearable
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Desa/Kelurahan</FLabel>
            <SearchSelect
              key={camatid}
              value={desaid}
              onChange={setDesaid}
              onLabelChange={setNamaDesa}
              fetchUrl={`/api/anakjuara/pg/ref/desa/lookup${camatid ? `?camatid=${encodeURIComponent(camatid)}` : ''}`}
              mapRow={r => ({ value: String(r.desaid), label: String(r.namaDesa ?? '') })}
              placeholder={camatid ? 'Cari desa...' : 'Pilih kecamatan dahulu'}
              disabled={!camatid}
              limit={20}
              clearable
            />
          </div>
        </div>

        <div style={sectionStyle}>Sekolah</div>
        <div className="pg-grid-3">
          <div style={fieldStyle}>
            <FLabel>Jenjang Pendidikan</FLabel>
            <SearchSelect
              value={jenjangPendidikan}
              onChange={setJenjangPendidikan}
              placeholder="Pilih..."
              options={JENJANG_OPTIONS.map(j => ({ value: j, label: j.toUpperCase() }))}
            />
          </div>
          <div style={fieldStyle}>
            <FLabel>Kelas</FLabel>
            <Input value={kelas} onChange={e => setKelas(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Jurusan</FLabel>
            <Input value={jurusan} onChange={e => setJurusan(e.target.value)} />
          </div>
        </div>
        <div style={fieldStyle}>
          <FLabel>Nama Sekolah</FLabel>
          <Input value={namaSekolah} onChange={e => setNamaSekolah(e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <FLabel>Alamat Sekolah</FLabel>
          <Textarea value={alamatSekolah} onChange={e => setAlamatSekolah(e.target.value)} rows={2} />
        </div>

        <div style={sectionStyle}>Orang Tua / Wali</div>
        <div className="pg-grid-3">
          <div style={fieldStyle}>
            <FLabel>Nama Ayah</FLabel>
            <Input value={namaLengkapAyah} onChange={e => setNamaLengkapAyah(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Pekerjaan Ayah</FLabel>
            <Input value={pekerjaanAyah} onChange={e => setPekerjaanAyah(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Penghasilan Ayah</FLabel>
            <Input type="number" value={penghasilanRataRataAyah} onChange={e => setPenghasilanRataRataAyah(e.target.value)} />
          </div>
        </div>
        <div className="pg-grid-3">
          <div style={fieldStyle}>
            <FLabel>Nama Ibu</FLabel>
            <Input value={namaLengkapIbu} onChange={e => setNamaLengkapIbu(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Pekerjaan Ibu</FLabel>
            <Input value={pekerjaanIbu} onChange={e => setPekerjaanIbu(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Penghasilan Ibu</FLabel>
            <Input type="number" value={penghasilanRataRataIbu} onChange={e => setPenghasilanRataRataIbu(e.target.value)} />
          </div>
        </div>
        <div className="pg-grid-2">
          <div style={fieldStyle}>
            <FLabel>Nama Wali</FLabel>
            <Input value={namaLengkapWali} onChange={e => setNamaLengkapWali(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Hubungan Kerabat</FLabel>
            <Input value={hubunganKerabat} onChange={e => setHubunganKerabat(e.target.value)} />
          </div>
        </div>

        <div style={sectionStyle}>Bank</div>
        <div className="pg-grid-3">
          <div style={fieldStyle}>
            <FLabel>No. Rekening</FLabel>
            <Input value={noRekening} onChange={e => setNoRekening(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Pemilik Rekening</FLabel>
            <Input value={pemilikRekening} onChange={e => setPemilikRekening(e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <FLabel>Nama Bank</FLabel>
            <Input value={namaBank} onChange={e => setNamaBank(e.target.value)} />
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FDEAEA', color: '#B02020', borderRadius: 10,
            padding: '10px 12px', fontSize: 13, fontWeight: 600, marginTop: 6,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Batal</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (<><Loader2 size={14} className="ajis-spin" /> Menyimpan...</>) : 'Simpan'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
