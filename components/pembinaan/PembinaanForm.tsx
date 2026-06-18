'use client';
import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { useCurrentSemester } from '@/hooks/useCurrentSemester';
import { useRouter } from 'next/navigation';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Input } from '@/components/ui/Input';
import { Btn } from '@/components/ui/Btn';
import { Modal } from '@/components/ui/Modal';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { MultiSearchSelect } from '@/components/ui/MultiSearchSelect';
import { AttendanceMatrix } from './AttendanceMatrix';
import {
  JENIS_PEMBINAAN_OPTIONS,
  DEFAULT_JENIS_PEMBINAAN,
  isParenting,
} from '@/lib/pembinaanConstants';
import type { AnakListRow, AnakListSource } from '@/types/anak';
import type { PembinaanAnakRow, Mandiri } from '@/types/pembinaan';

interface PembinaanFormProps {
  initialData?: {
    id_pembinaan?:     string;
    tgl_pembinaan:    string;
    semesterid:       string;
    semester_label?:  string;
    jenis_pembinaan:  string;
    p3a?:             string;
    judul_materi:     string;
    pemateri:         string;
    anak:             PembinaanAnakRow[];
  };
  isEdit?:            boolean;
}

const jenisOptions = JENIS_PEMBINAAN_OPTIONS.map(j => ({ value: j, label: j }));

function parsePemateriNames(pemateri: string): string[] {
  if (!pemateri?.trim()) return [];
  return pemateri.split(',').map(s => s.trim()).filter(Boolean);
}

function mapApiRowsToPembinaan(rows: AnakListRow[]): PembinaanAnakRow[] {
  return rows.map(a => ({
    id_row:             0,
    id_pembinaan:       '',
    id_anak:            a.id_anak,
    nama_lengkap:       a.nama_lengkap,
    jenjang_pendidikan: a.jenjang_pendidikan,
    status_ortu:        a.status_ortu,
    jns_kel:            a.jns_kel,
    kehadiran:          'y',
    keterangan:         '',
    pembiasaan_shalat_wajib: 1,
    pembiasaan_tilawah: 1,
    pembiasaan_sedekah: 1,
    membantu_ortu:      1,
  }));
}

function buildMatrixState(list: PembinaanAnakRow[]) {
  const kehadiran: Record<string, 'y' | 'n'> = {};
  const keterangan: Record<string, string> = {};
  const mandiri: Record<string, Mandiri> = {};
  const ortuHadir: Record<string, string> = {};

  list.forEach(anak => {
    kehadiran[anak.id_anak] = anak.kehadiran || 'y';
    keterangan[anak.id_anak] = anak.keterangan || '';
    mandiri[anak.id_anak] = {
      shalat_wajib: !!anak.pembiasaan_shalat_wajib,
      tilawah:      !!anak.pembiasaan_tilawah,
      sedekah:      !!anak.pembiasaan_sedekah,
      bantu_ortu:   !!anak.membantu_ortu,
    };
    ortuHadir[anak.id_anak] = anak.ortu_hadir || '';
  });

  return { kehadiran, keterangan, mandiri, ortuHadir };
}

export function PembinaanForm({ initialData, isEdit = false }: PembinaanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tglPembinaan, setTglPembinaan] = useState(
    initialData?.tgl_pembinaan ? initialData.tgl_pembinaan.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const { current: activeSemester } = useCurrentSemester(!isEdit);
  const [semesterid, setSemesterid] = useState(initialData?.semesterid || '');
  const [semesterLabel, setSemesterLabel] = useState(initialData?.semester_label || '');
  const [jenisPembinaan, setJenisPembinaan] = useState(
    initialData?.jenis_pembinaan || DEFAULT_JENIS_PEMBINAAN,
  );
  const [p3a, setP3a] = useState(initialData?.p3a || '');
  const [judulMateri, setJudulMateri] = useState(initialData?.judul_materi || '');
  const [pemateriSelected, setPemateriSelected] = useState<string[]>(
    parsePemateriNames(initialData?.pemateri || ''),
  );

  const [loadedAnakList, setLoadedAnakList] = useState<PembinaanAnakRow[]>([]);
  const [anakSource, setAnakSource] = useState<AnakListSource>('anak');
  const [mentorIdSdm, setMentorIdSdm] = useState('');
  const [mentorLabel, setMentorLabel] = useState('');
  const [loadingAnak, setLoadingAnak] = useState(false);
  const [anakLoaded, setAnakLoaded] = useState(false);

  const editMatrixInit = isEdit && initialData?.anak ? buildMatrixState(initialData.anak) : null;
  const [kehadiran, setKehadiran] = useState<Record<string, 'y' | 'n'>>(editMatrixInit?.kehadiran ?? {});
  const [keterangan, setKeterangan] = useState<Record<string, string>>(editMatrixInit?.keterangan ?? {});
  const [mandiri, setMandiri] = useState<Record<string, Mandiri>>(editMatrixInit?.mandiri ?? {});
  const [ortuHadir, setOrtuHadir] = useState<Record<string, string>>(editMatrixInit?.ortuHadir ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isEdit || semesterid || !activeSemester) return;
    setSemesterid(activeSemester.semesterid);
    setSemesterLabel(
      `${activeSemester.semester}${activeSemester.is_current ? ' (Aktif)' : ''}`,
    );
  }, [isEdit, semesterid, activeSemester]);

  const listToUse = isEdit ? (initialData?.anak ?? []) : loadedAnakList;
  const showParenting = isParenting(jenisPembinaan);
  const showP3a = jenisPembinaan === 'P3A';

  async function handleLoadAnak() {
    setLoadingAnak(true);
    try {
      const params = new URLSearchParams({ source: anakSource, limit: '500' });
      if (mentorIdSdm) params.set('id_sdm', mentorIdSdm);

      const res = await fetch(`/api/anakjuara/anak?${params}`);
      const json = await res.json() as { data?: AnakListRow[]; error?: string };
      if (!res.ok) throw new Error(json.error || 'Gagal memuat daftar anak.');

      const mapped = mapApiRowsToPembinaan(json.data ?? []);
      const state = buildMatrixState(mapped);
      setLoadedAnakList(mapped);
      setKehadiran(state.kehadiran);
      setKeterangan(state.keterangan);
      setMandiri(state.mandiri);
      setOrtuHadir(state.ortuHadir);
      setAnakLoaded(true);
      toast.success(`${mapped.length} anak dimuat.`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal memuat daftar anak.');
    } finally {
      setLoadingAnak(false);
    }
  }

  function handleMatrixChange(
    nextKehadiran:  Record<string, 'y' | 'n'>,
    nextKeterangan: Record<string, string>,
    nextMandiri:    Record<string, Mandiri>,
    nextOrtu?:       Record<string, string>,
  ) {
    setKehadiran(nextKehadiran);
    setKeterangan(nextKeterangan);
    setMandiri(nextMandiri);
    if (nextOrtu) setOrtuHadir(nextOrtu);
  }

  function validate(): string | null {
    if (!tglPembinaan) return 'Tanggal pembinaan wajib diisi.';
    if (!semesterid) return 'Semester wajib dipilih.';
    if (!jenisPembinaan) return 'Jenis pembinaan wajib dipilih.';
    if (showP3a && !p3a.trim()) return 'Field P3A wajib diisi.';
    if (!judulMateri.trim()) return 'Tema materi wajib diisi.';
    if (pemateriSelected.length === 0) return 'Pilih minimal satu pemateri.';
    if (!isEdit && listToUse.length === 0) return 'Muat daftar anak terlebih dahulu.';

    if (showParenting) {
      for (const anak of listToUse) {
        if (kehadiran[anak.id_anak] === 'y' && !ortuHadir[anak.id_anak]) {
          return `Pilih ortu hadir untuk ${anak.nama_lengkap}.`;
        }
      }
    }

    for (const anak of listToUse) {
      if (kehadiran[anak.id_anak] === 'n' && !(keterangan[anak.id_anak] || '').trim()) {
        return `Isi keterangan untuk anak yang tidak hadir: ${anak.nama_lengkap}.`;
      }
    }

    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (isEdit) {
      setShowConfirm(true);
    } else {
      void doSave();
    }
  }

  async function doSave() {
    setSubmitting(true);

    const payloadKehadiran: Record<string, { hadir: 'y' | 'n'; keterangan: string }> = {};
    const payloadMandiri: Record<string, Mandiri> = {};
    const payloadOrtu: Record<string, string> = {};

    listToUse.forEach(anak => {
      const id = anak.id_anak;
      payloadKehadiran[id] = {
        hadir:      kehadiran[id] ?? 'y',
        keterangan: kehadiran[id] === 'y' ? '' : (keterangan[id] || 'Alfa'),
      };
      payloadMandiri[id] = mandiri[id] || {
        shalat_wajib: false, tilawah: false, sedekah: false, bantu_ortu: false,
      };
      payloadOrtu[id] = showParenting && kehadiran[id] === 'y' ? (ortuHadir[id] || '') : '';
    });

    const url = isEdit
      ? `/api/anakjuara/pembinaan/${initialData?.id_pembinaan}`
      : '/api/anakjuara/pembinaan';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tgl_pembinaan:   isEdit ? undefined : tglPembinaan,
          semesterid:      isEdit ? undefined : semesterid,
          jenis_pembinaan: jenisPembinaan,
          p3a:             showP3a ? p3a : '',
          judul_materi:    judulMateri,
          pemateri:        pemateriSelected.join(','),
          kehadiran:       payloadKehadiran,
          mandiri:         payloadMandiri,
          ortu_hadir:      payloadOrtu,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Gagal menyimpan');

      toast.success(isEdit ? 'Sesi pembinaan berhasil diperbarui!' : 'Sesi pembinaan berhasil ditambahkan!');
      if (isEdit && initialData?.id_pembinaan) {
        router.push(`/pembinaan/${initialData.id_pembinaan}`);
      } else {
        router.push('/pembinaan');
      }
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan data.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <CardHead title={isEdit ? 'Edit Sesi Pembinaan' : 'Tambah Sesi Pembinaan'} />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <FLabel>Tanggal Pembinaan</FLabel>
            <Input
              type="date"
              value={tglPembinaan}
              onChange={e => setTglPembinaan(e.target.value)}
              required
              disabled={isEdit}
            />
          </div>

          <div>
            <FLabel>Semester</FLabel>
            <SearchSelect
              fetchUrl="/api/anakjuara/semester"
              value={semesterid}
              onChange={setSemesterid}
              onLabelChange={setSemesterLabel}
              resolvedLabel={semesterLabel}
              placeholder="Ketik nama semester..."
              disabled={isEdit}
            />
          </div>

          <div>
            <FLabel>Jenis Pembinaan</FLabel>
            <SearchSelect
              options={jenisOptions}
              value={jenisPembinaan}
              onChange={v => {
                setJenisPembinaan(v);
                if (v !== 'P3A') setP3a('');
              }}
              placeholder="Ketik jenis pembinaan..."
            />
          </div>

          {showP3a && (
            <div style={{ gridColumn: '1 / -1' }}>
              <FLabel>Keterangan P3A</FLabel>
              <Input
                value={p3a}
                onChange={e => setP3a(e.target.value)}
                placeholder="Isi nama / keterangan kegiatan P3A..."
                required
              />
            </div>
          )}

          <div style={{ gridColumn: '1 / -1' }}>
            <MultiSearchSelect
              value={pemateriSelected}
              onChange={setPemateriSelected}
              fetchUrl="/api/anakjuara/pemateri"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <FLabel>Tema Materi</FLabel>
            <Input
              value={judulMateri}
              onChange={e => setJudulMateri(e.target.value)}
              placeholder="Masukkan materi/pembahasan utama..."
              required
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHead title="Daftar Kehadiran Anak Juara" />
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isEdit && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
              padding: 14,
              background: '#FBF0E8',
              borderRadius: 10,
              border: '1px solid #F0C4A0',
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FLabel>Sumber Data Anak</FLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1A0A00', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="anakSource"
                      value="anak"
                      checked={anakSource === 'anak'}
                      onChange={() => setAnakSource('anak')}
                    />
                    Data Anak (ajis_anak)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1A0A00', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="anakSource"
                      value="pemasangan"
                      checked={anakSource === 'pemasangan'}
                      onChange={() => setAnakSource('pemasangan')}
                    />
                    Data Pemasangan aktif (status_pasangan = y)
                  </label>
                </div>
              </div>

              <div>
                <FLabel>Filter Mentor (opsional)</FLabel>
                <SearchSelect
                  fetchUrl="/api/anakjuara/pemateri"
                  value={mentorIdSdm}
                  onChange={setMentorIdSdm}
                  onLabelChange={setMentorLabel}
                  resolvedLabel={mentorLabel}
                  placeholder="Ketik nama mentor..."
                  clearable
                  allowEmpty
                  emptyLabel="Semua mentor"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Btn
                  type="button"
                  variant="primary"
                  onClick={() => void handleLoadAnak()}
                  disabled={loadingAnak}
                  style={{ width: '100%' }}
                >
                  {loadingAnak ? 'Memuat...' : 'Tampilkan Data Anak'}
                </Btn>
              </div>
            </div>
          )}

          {!isEdit && !anakLoaded && (
            <p style={{ fontSize: 13, color: '#7A6055', margin: 0, textAlign: 'center', padding: '8px 0' }}>
              Pilih sumber data, opsional filter mentor, lalu klik Tampilkan Data Anak.
            </p>
          )}

          <AttendanceMatrix
            anakList={listToUse}
            kehadiran={kehadiran}
            keterangan={keterangan}
            mandiri={mandiri}
            ortuHadir={ortuHadir}
            showParenting={showParenting}
            onChange={handleMatrixChange}
          />
        </div>
      </Card>

      <div style={{ display: 'flex', justifySelf: 'flex-end', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
        <Btn type="button" onClick={() => router.back()} variant="outline">
          Batal
        </Btn>
        <Btn type="submit" variant="primary" disabled={submitting || isPending}>
          {submitting ? 'Menyimpan...' : 'Simpan Pembinaan'}
        </Btn>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Konfirmasi Update"
      >
        <p style={{ fontSize: 14, color: '#1A0A00', marginBottom: 20 }}>
          Apakah Anda yakin ingin menyimpan perubahan sesi pembinaan ini?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn
            type="button"
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={submitting}
          >
            Batal
          </Btn>
          <Btn
            type="button"
            variant="primary"
            disabled={submitting}
            onClick={() => { setShowConfirm(false); void doSave(); }}
          >
            {submitting ? 'Menyimpan...' : 'Ya, Update'}
          </Btn>
        </div>
      </Modal>
    </form>
  );
}
