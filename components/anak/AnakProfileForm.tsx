'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea, Sel } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { Btn } from '@/components/ui/Btn';
import type { AnakDetail } from '@/types/anak';

interface AnakProfileFormProps {
  anak: AnakDetail;
  onSaved: (updated: AnakDetail) => void;
  onCancel: () => void;
}

/** ISO datetime/date -> yyyy-mm-dd for <input type="date">. */
function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const FIELD_STYLE: React.CSSProperties = {};

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : undefined}>
      <FLabel>{label}</FLabel>
      {children}
    </div>
  );
}

const JENJANG_OPTIONS = ['SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA', 'PT'];
const STATUS_ORTU_OPTIONS = ['Lengkap', 'Yatim', 'Piatu', 'Yatim Piatu', 'Dhuafa'];
const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const ASNAF_OPTIONS = ['Fakir', 'Miskin', 'Amil', 'Muallaf', 'Gharimin', 'Fii Sabilillah', 'Ibnu Sabil', 'Hamba Sahaya'];
const PEKERJAAN_OPTIONS = [
  'Petani', 'Buruh', 'Pedagang', 'Wiraswasta', 'Karyawan Swasta', 'PNS/ASN', 'TNI/Polri',
  'Sopir/Ojek', 'Nelayan', 'Ibu Rumah Tangga', 'Tidak Bekerja', 'Sudah Meninggal', 'Lainnya',
];

/**
 * Plain <select> from a curated static list, e.g. Jenjang Pendidikan or Asnaf.
 * The legacy MySQL columns behind these are free-text varchar, so an already-saved
 * value outside the curated list is kept as an extra option instead of being silently
 * dropped/replaced the moment the form renders.
 */
function StaticSel({ value, options, onChange, placeholder }: {
  value: string; options: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  const hasValue = !value || options.includes(value);
  return (
    <Sel value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder ?? '—'}</option>
      {!hasValue && <option value={value}>{value} (nilai lama)</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </Sel>
  );
}

export function AnakProfileForm({ anak, onSaved, onCancel }: AnakProfileFormProps) {
  const [form, setForm] = useState<AnakDetail>(() => ({
    ...anak,
    tgl_lahir: toDateInput(anak.tgl_lahir),
    tgl_terdaftar: toDateInput(anak.tgl_terdaftar),
    tgl_pengajuan: toDateInput(anak.tgl_pengajuan),
    tanggal_kematian_ayah: toDateInput(anak.tanggal_kematian_ayah),
    tanggal_kematian_ibu: toDateInput(anak.tanggal_kematian_ibu),
  }));
  const [saving, setSaving] = useState(false);

  function set<K extends keyof AnakDetail>(field: K, value: AnakDetail[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function onText(field: keyof AnakDetail) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(field, e.target.value as never);
  }

  function onNumber(field: keyof AnakDetail) {
    return (e: React.ChangeEvent<HTMLInputElement>) => set(field, (e.target.value === '' ? null : Number(e.target.value)) as never);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/anakjuara/anak/${encodeURIComponent(anak.id_anak)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Server whitelists to editable ajis_anak columns; id_anak/nama_wilayah/nama_kantor are ignored.
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal menyimpan data anak.');
        return;
      }
      toast.success('Data anak berhasil disimpan.');
      onSaved(json.data as AnakDetail);
    } catch {
      toast.error('Gagal menyimpan data anak.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <CardHead title="Data Diri & Pendidikan" />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, ...FIELD_STYLE }}>
          <Field label="NIK (KTP/KIA)"><Input value={form.nik} onChange={onText('nik')} /></Field>
          <Field label="Nama Lengkap"><Input value={form.nama_lengkap} onChange={onText('nama_lengkap')} required /></Field>
          <Field label="Nama Panggilan"><Input value={form.nama_panggilan} onChange={onText('nama_panggilan')} /></Field>
          <Field label="Jenis Kelamin">
            <Sel value={form.jns_kel} onChange={e => set('jns_kel', e.target.value as AnakDetail['jns_kel'])}>
              <option value="l">Laki-laki</option>
              <option value="p">Perempuan</option>
            </Sel>
          </Field>
          <Field label="Tempat Lahir"><Input value={form.tempat_lahir} onChange={onText('tempat_lahir')} /></Field>
          <Field label="Tanggal Lahir"><Input type="date" value={form.tgl_lahir} onChange={onText('tgl_lahir')} required /></Field>
          <Field label="Agama"><StaticSel value={form.agama} options={AGAMA_OPTIONS} onChange={v => set('agama', v)} /></Field>
          <Field label="Anak Ke"><Input value={form.anak_ke} onChange={onText('anak_ke')} /></Field>
          <Field label="Dari Saudara"><Input value={form.dari_saudara} onChange={onText('dari_saudara')} /></Field>
          <Field label="Hobi / Kegemaran"><Input value={form.hobi} onChange={onText('hobi')} /></Field>
          <Field label="Prestasi"><Input value={form.prestasi} onChange={onText('prestasi')} /></Field>
          <Field label="Sekolah / Lembaga"><Input value={form.nama_sekolah} onChange={onText('nama_sekolah')} /></Field>
          <Field label="Alamat Sekolah"><Input value={form.alamat_sekolah} onChange={onText('alamat_sekolah')} /></Field>
          <Field label="Jenjang Pendidikan"><StaticSel value={form.jenjang_pendidikan} options={JENJANG_OPTIONS} onChange={v => set('jenjang_pendidikan', v)} /></Field>
          <Field label="Kelas"><Input value={form.kelas} onChange={onText('kelas')} /></Field>
          <Field label="Jurusan (Kuliah)"><Input value={form.jurusan} onChange={onText('jurusan')} /></Field>
          <Field label="Semester (Kuliah)"><Input type="number" value={form.semester ?? ''} onChange={onNumber('semester')} /></Field>
          <Field label="Nama Perguruan Tinggi"><Input value={form.nama_pt} onChange={onText('nama_pt')} /></Field>
          <Field label="Alamat Perguruan Tinggi"><Input value={form.alamat_pt} onChange={onText('alamat_pt')} /></Field>
          <Field label="Nilai / Prestasi Akademik"><Input value={form.nilai} onChange={onText('nilai')} /></Field>
          <Field label="Pelajaran Favorit"><Input value={form.pelajaran_favorit} onChange={onText('pelajaran_favorit')} /></Field>
          <Field label="Jarak Rumah ke Sekolah"><Input value={form.jarak_rumah} onChange={onText('jarak_rumah')} /></Field>
          <Field label="Alat Transportasi"><Input value={form.alat_transportasi} onChange={onText('alat_transportasi')} /></Field>
          <Field label="No. Kartu Keluarga"><Input value={form.no_kartu_keluarga} onChange={onText('no_kartu_keluarga')} /></Field>
          <Field label="Asnaf"><StaticSel value={form.asnaf} options={ASNAF_OPTIONS} onChange={v => set('asnaf', v)} /></Field>
          <Field label="Status Ortu"><StaticSel value={form.status_ortu} options={STATUS_ORTU_OPTIONS} onChange={v => set('status_ortu', v)} /></Field>
          <Field label="Status Tersantuni">
            <Sel value={form.status_tersantuni ?? ''} onChange={e => set('status_tersantuni', e.target.value as AnakDetail['status_tersantuni'])}>
              <option value="">—</option>
              <option value="su">su</option>
              <option value="b">b</option>
              <option value="se">se</option>
              <option value="t">t</option>
            </Sel>
          </Field>
          <Field label="Kantor">
            <SearchSelect
              value={form.kantor_id ?? ''}
              onChange={v => {
                // Kantor -> wilayah is a cascading pair (mirrors the legacy app's
                // combogrid onSelect reload) — changing kantor invalidates the
                // previously selected wilayah, which belongs to the old kantor.
                setForm(prev => ({ ...prev, kantor_id: v, id_wilayah_pembinaan: 0 as AnakDetail['id_wilayah_pembinaan'] }));
              }}
              fetchUrl="/api/anakjuara/kantor/lookup"
              resolvedLabel={anak.nama_kantor}
              mapRow={row => (
                row.id_kantor ? { value: String(row.id_kantor), label: String(row.nama_kantor ?? '') } : null
              )}
              placeholder="Ketik nama kantor…"
            />
          </Field>
          <Field label="Wilayah Binaan">
            <SearchSelect
              key={form.kantor_id || 'no-kantor'}
              value={String(form.id_wilayah_pembinaan ?? '')}
              onChange={v => set('id_wilayah_pembinaan', (v ? Number(v) : 0) as AnakDetail['id_wilayah_pembinaan'])}
              fetchUrl={`/api/anakjuara/wilayah${form.kantor_id ? `?kantor_id=${encodeURIComponent(form.kantor_id)}` : ''}`}
              resolvedLabel={form.kantor_id === anak.kantor_id ? anak.nama_wilayah : undefined}
              disabled={!form.kantor_id}
              mapRow={row => (
                row.id_wilayah_pembinaan != null
                  ? { value: String(row.id_wilayah_pembinaan), label: String(row.nama_wilayah ?? '') }
                  : null
              )}
              placeholder={form.kantor_id ? 'Ketik nama wilayah…' : 'Pilih kantor terlebih dahulu'}
            />
          </Field>
          <Field label="Tanggal Terdaftar"><Input type="date" value={form.tgl_terdaftar} onChange={onText('tgl_terdaftar')} /></Field>
          <Field label="Tanggal Pengajuan"><Input type="date" value={form.tgl_pengajuan ?? ''} onChange={onText('tgl_pengajuan')} /></Field>
          <Field label="Status Aktif">
            <Sel value={form.aktif} onChange={e => set('aktif', e.target.value as AnakDetail['aktif'])}>
              <option value="y">Aktif</option>
              <option value="n">Tidak Aktif</option>
            </Sel>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHead title="Data Orang Tua / Wali" />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Nama Ayah"><Input value={form.nama_lengkap_ayah} onChange={onText('nama_lengkap_ayah')} /></Field>
          <Field label="Pekerjaan Ayah"><StaticSel value={form.pekerjaan_ayah} options={PEKERJAAN_OPTIONS} onChange={v => set('pekerjaan_ayah', v)} /></Field>
          <Field label="Penghasilan Rata-rata Ayah"><Input value={form.penghasilan_rata_rata_ayah} onChange={onText('penghasilan_rata_rata_ayah')} /></Field>
          <Field label="Tanggal Wafat Ayah"><Input type="date" value={form.tanggal_kematian_ayah ?? ''} onChange={onText('tanggal_kematian_ayah')} /></Field>
          <Field label="Penyebab Wafat Ayah"><Input value={form.penyebab_kematian_ayah} onChange={onText('penyebab_kematian_ayah')} /></Field>
          <Field label="Nama Ibu"><Input value={form.nama_lengkap_ibu} onChange={onText('nama_lengkap_ibu')} /></Field>
          <Field label="Pekerjaan Ibu"><StaticSel value={form.pekerjaan_ibu} options={PEKERJAAN_OPTIONS} onChange={v => set('pekerjaan_ibu', v)} /></Field>
          <Field label="Penghasilan Rata-rata Ibu"><Input value={form.penghasilan_rata_rata_ibu} onChange={onText('penghasilan_rata_rata_ibu')} /></Field>
          <Field label="Tanggal Wafat Ibu"><Input type="date" value={form.tanggal_kematian_ibu ?? ''} onChange={onText('tanggal_kematian_ibu')} /></Field>
          <Field label="Penyebab Wafat Ibu"><Input value={form.penyebab_kematian_ibu} onChange={onText('penyebab_kematian_ibu')} /></Field>
          <Field label="Nama Wali"><Input value={form.nama_lengkap_wali} onChange={onText('nama_lengkap_wali')} /></Field>
          <Field label="Pekerjaan Wali"><Input value={form.pekerjaan_wali} onChange={onText('pekerjaan_wali')} /></Field>
          <Field label="Penghasilan Rata-rata Wali"><Input value={form.penghasilan_rata_rata_wali} onChange={onText('penghasilan_rata_rata_wali')} /></Field>
          <Field label="Alamat Tinggal" full><Textarea value={form.alamat} onChange={onText('alamat')} /></Field>
          <Field label="Tinggal Bersama"><Input value={form.tinggal_bersama} onChange={onText('tinggal_bersama')} /></Field>
          <Field label="Nama yang Ditinggali"><Input value={form.nama_tinggal} onChange={onText('nama_tinggal')} /></Field>
          <Field label="Keterangan Tinggal"><Input value={form.ket_tinggal} onChange={onText('ket_tinggal')} /></Field>
          <Field label="Penghasilan Tempat Tinggal"><Input value={form.penghasilan_tinggal} onChange={onText('penghasilan_tinggal')} /></Field>
          <Field label="Pekerjaan Tempat Tinggal"><Input value={form.pekerjaan_tinggal} onChange={onText('pekerjaan_tinggal')} /></Field>
          <Field label="Sebab Tidak Serumah Ortu"><Input value={form.tidak_serumah_ortu} onChange={onText('tidak_serumah_ortu')} /></Field>
        </div>
      </Card>

      <Card>
        <CardHead title="Status & Administrasi" />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Status Survey">
            <Sel value={form.status_survey} onChange={e => set('status_survey', e.target.value as AnakDetail['status_survey'])}>
              <option value="y">Sudah</option>
              <option value="n">Belum</option>
            </Sel>
          </Field>
          <Field label="Status Kelayakan">
            <Sel value={form.status_kelayakan} onChange={e => set('status_kelayakan', e.target.value as AnakDetail['status_kelayakan'])}>
              <option value="y">Layak</option>
              <option value="n">Tidak Layak</option>
            </Sel>
          </Field>
          <Field label="Status Anak Juara">
            <Sel value={form.status_anak_juara} onChange={e => set('status_anak_juara', e.target.value)}>
              <option value="">—</option>
              <option value="caj">Calon Anak Juara</option>
              <option value="aj">Anak Juara</option>
              <option value="non">Non Anak Juara</option>
            </Sel>
          </Field>
          <Field label="Status Peminjaman">
            <Sel value={form.status_pinjam} onChange={e => set('status_pinjam', e.target.value as AnakDetail['status_pinjam'])}>
              <option value="y">Ya</option>
              <option value="n">Tidak</option>
            </Sel>
          </Field>
          <Field label="Status Mentor">
            <Sel value={form.status_mentor} onChange={e => set('status_mentor', e.target.value as AnakDetail['status_mentor'])}>
              <option value="y">Ya</option>
              <option value="n">Tidak</option>
            </Sel>
          </Field>
          <Field label="Alumni Juara">
            <Sel value={form.alumni_juara} onChange={e => set('alumni_juara', e.target.value as AnakDetail['alumni_juara'])}>
              <option value="">—</option>
              <option value="y">Ya</option>
              <option value="n">Tidak</option>
            </Sel>
          </Field>
          <Field label="Juara"><Input value={form.juara} onChange={onText('juara')} /></Field>
          <Field label="ID SDM / Pendamping"><Input value={form.id_sdm} onChange={onText('id_sdm')} /></Field>
          <Field label="Nama Mentor"><Input value={form.nama_mentor} onChange={onText('nama_mentor')} /></Field>
        </div>
      </Card>

      <Card>
        <CardHead title="Kontak & Informasi Perbankan" />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Telepon Hubung"><Input value={form.telp_yang_bisa_dihubungi} onChange={onText('telp_yang_bisa_dihubungi')} /></Field>
          <Field label="Atas Nama"><Input value={form.atas_nama} onChange={onText('atas_nama')} /></Field>
          <Field label="Hubungan Kerabat"><Input value={form.hubungan_kerabat} onChange={onText('hubungan_kerabat')} /></Field>
          <Field label="Nama Pemilik Rekening"><Input value={form.pemilik_rekening} onChange={onText('pemilik_rekening')} /></Field>
          <Field label="Nomor Rekening"><Input value={form.no_rekening} onChange={onText('no_rekening')} /></Field>
          <Field label="Nama Bank"><Input value={form.nama_bank} onChange={onText('nama_bank')} /></Field>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn type="button" variant="ghost" onClick={onCancel} disabled={saving}>Batal</Btn>
        <Btn type="submit" variant="primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Btn>
      </div>
    </form>
  );
}
