'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Sel } from '@/components/ui/Input';
import { Btn } from '@/components/ui/Btn';
import { AttendanceMatrix } from './AttendanceMatrix';
import type { PembinaanAnakRow, Mandiri } from '@/types/pembinaan';

interface PembinaanFormProps {
  initialData?: {
    id_pembinaan?:    string;
    tgl_pembinaan:   string;
    semesterid:      string;
    jenis_pembinaan: string;
    judul_materi:    string;
    pemateri:        string;
    anak:            PembinaanAnakRow[];
  };
  anakList:          PembinaanAnakRow[]; // For new mode
  isEdit?:           boolean;
}

export function PembinaanForm({ initialData, anakList, isEdit = false }: PembinaanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tglPembinaan, setTglPembinaan] = useState(initialData?.tgl_pembinaan ? initialData.tgl_pembinaan.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [semesterid, setSemesterid] = useState(initialData?.semesterid || '25');
  const [jenisPembinaan, setJenisPembinaan] = useState(initialData?.jenis_pembinaan || 'Pembinaan Wilayah');
  const [judulMateri, setJudulMateri] = useState(initialData?.judul_materi || '');
  const [pemateri, setPemateri] = useState(initialData?.pemateri || '');

  // Pre-populate attendance state maps
  const initKehadiran: Record<string, 'y' | 'n'> = {};
  const initKeterangan: Record<string, string> = {};
  const initMandiri: Record<string, Mandiri> = {};

  const listToUse = isEdit ? (initialData?.anak ?? []) : anakList;

  listToUse.forEach(anak => {
    initKehadiran[anak.id_anak] = anak.kehadiran || 'y';
    initKeterangan[anak.id_anak] = anak.keterangan || '';
    initMandiri[anak.id_anak] = {
      shalat_wajib: !!anak.pembiasaan_shalat_wajib,
      tilawah:      !!anak.pembiasaan_tilawah,
      sedekah:      !!anak.pembiasaan_sedekah,
      bantu_ortu:   !!anak.membantu_ortu,
    };
  });

  const [kehadiran, setKehadiran] = useState<Record<string, 'y' | 'n'>>(initKehadiran);
  const [keterangan, setKeterangan] = useState<Record<string, string>>(initKeterangan);
  const [mandiri, setMandiri] = useState<Record<string, Mandiri>>(initMandiri);
  const [submitting, setSubmitting] = useState(false);

  function handleMatrixChange(
    nextKehadiran:  Record<string, 'y' | 'n'>,
    nextKeterangan: Record<string, string>,
    nextMandiri:    Record<string, Mandiri>,
  ) {
    setKehadiran(nextKehadiran);
    setKeterangan(nextKeterangan);
    setMandiri(nextMandiri);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!judulMateri.trim() || !pemateri.trim()) {
      alert('Tema materi dan pemateri wajib diisi.');
      return;
    }

    setSubmitting(true);

    const payloadKehadiran: Record<string, { hadir: 'y' | 'n'; keterangan: string }> = {};
    const payloadMandiri: Record<string, Mandiri> = {};

    listToUse.forEach(anak => {
      const id = anak.id_anak;
      payloadKehadiran[id] = {
        hadir:      kehadiran[id] ?? 'y',
        keterangan: kehadiran[id] === 'y' ? '' : (keterangan[id] || 'Alfa'),
      };
      payloadMandiri[id] = mandiri[id] || { shalat_wajib: false, tilawah: false, sedekah: false, bantu_ortu: false };
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
          tgl_pembinaan:   tglPembinaan,
          semesterid,
          jenis_pembinaan: jenisPembinaan,
          judul_materi:    judulMateri,
          pemateri,
          kehadiran:       payloadKehadiran,
          mandiri:         payloadMandiri,
        }),
      });

      if (!res.ok) throw new Error();

      alert(isEdit ? 'Pembinaan berhasil diperbarui!' : 'Pembinaan berhasil ditambahkan!');
      startTransition(() => {
        router.push('/pembinaan');
        router.refresh();
      });
    } catch {
      alert('Terjadi kesalahan saat menyimpan data.');
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
            <Input type="date" value={tglPembinaan} onChange={e => setTglPembinaan(e.target.value)} required disabled={isEdit} />
          </div>

          <div>
            <FLabel>Semester</FLabel>
            <Sel value={semesterid} onChange={e => setSemesterid(e.target.value)} disabled={isEdit}>
              <option value="25">Semester Ganjil 2025/2026</option>
              <option value="26">Semester Genap 2025/2026</option>
            </Sel>
          </div>

          <div>
            <FLabel>Jenis Pembinaan</FLabel>
            <Sel value={jenisPembinaan} onChange={e => setJenisPembinaan(e.target.value)}>
              <option value="Pembinaan Wilayah">Pembinaan Wilayah</option>
              <option value="Pekan Berbagi Senyum">Pekan Berbagi Senyum</option>
              <option value="Mentoring Online">Mentoring Online</option>
            </Sel>
          </div>

          <div>
            <FLabel>Pemateri</FLabel>
            <Input value={pemateri} onChange={e => setPemateri(e.target.value)} placeholder="Nama Pemateri..." required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <FLabel>Tema Materi</FLabel>
            <Input value={judulMateri} onChange={e => setJudulMateri(e.target.value)} placeholder="Masukkan materi/pembahasan utama..." required />
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
            onChange={handleMatrixChange}
          />
        </div>
      </Card>

      <div style={{ display: 'flex', justifySelf: 'flex-end', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
        <Btn onClick={() => router.back()} variant="outline">
          Batal
        </Btn>
        <Btn type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Pembinaan'}
        </Btn>
      </div>
    </form>
  );
}
