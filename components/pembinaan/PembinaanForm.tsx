'use client';
import { useState, useTransition, useEffect } from 'react';
import { useCurrentSemester } from '@/hooks/useCurrentSemester';
import { useRouter } from 'next/navigation';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Input } from '@/components/ui/Input';
import { Btn } from '@/components/ui/Btn';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { MultiSearchSelect } from '@/components/ui/MultiSearchSelect';
import { AttendanceMatrix } from './AttendanceMatrix';
import {
  JENIS_PEMBINAAN_OPTIONS,
  DEFAULT_JENIS_PEMBINAAN,
  isParenting,
} from '@/lib/pembinaanConstants';
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
  anakList:           PembinaanAnakRow[];
  isEdit?:            boolean;
}

const jenisOptions = JENIS_PEMBINAAN_OPTIONS.map(j => ({ value: j, label: j }));

function parsePemateriNames(pemateri: string): string[] {
  if (!pemateri?.trim()) return [];
  return pemateri.split(',').map(s => s.trim()).filter(Boolean);
}

export function PembinaanForm({ initialData, anakList, isEdit = false }: PembinaanFormProps) {
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

  useEffect(() => {
    if (isEdit || semesterid || !activeSemester) return;
    setSemesterid(activeSemester.semesterid);
    setSemesterLabel(
      `${activeSemester.semester}${activeSemester.is_current ? ' (Aktif)' : ''}`,
    );
  }, [isEdit, semesterid, activeSemester]);

  const listToUse = isEdit ? (initialData?.anak ?? []) : anakList;
  const showParenting = isParenting(jenisPembinaan);
  const showP3a = jenisPembinaan === 'P3A';

  const initKehadiran: Record<string, 'y' | 'n'> = {};
  const initKeterangan: Record<string, string> = {};
  const initMandiri: Record<string, Mandiri> = {};
  const initOrtuHadir: Record<string, string> = {};

  listToUse.forEach(anak => {
    initKehadiran[anak.id_anak] = anak.kehadiran || 'y';
    initKeterangan[anak.id_anak] = anak.keterangan || '';
    initMandiri[anak.id_anak] = {
      shalat_wajib: !!anak.pembiasaan_shalat_wajib,
      tilawah:      !!anak.pembiasaan_tilawah,
      sedekah:      !!anak.pembiasaan_sedekah,
      bantu_ortu:   !!anak.membantu_ortu,
    };
    initOrtuHadir[anak.id_anak] = anak.ortu_hadir || '';
  });

  const [kehadiran, setKehadiran] = useState(initKehadiran);
  const [keterangan, setKeterangan] = useState(initKeterangan);
  const [mandiri, setMandiri] = useState(initMandiri);
  const [ortuHadir, setOrtuHadir] = useState(initOrtuHadir);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

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

      alert(isEdit ? 'Pembinaan berhasil diperbarui!' : 'Pembinaan berhasil ditambahkan!');
      startTransition(() => {
        router.push('/pembinaan');
        router.refresh();
      });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan data.');
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
        <div style={{ padding: 14 }}>
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
    </form>
  );
}
