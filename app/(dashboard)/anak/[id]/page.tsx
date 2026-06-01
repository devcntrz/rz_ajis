'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useAnakDetail } from '@/hooks/useAnakList';
import { usePenilaianDetail } from '@/hooks/usePenilaian';
import { TabBar } from '@/components/ui/TabBar';
import { Card, CardHead } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Sel } from '@/components/ui/Input';
import { KehadiranTable } from '@/components/anak/KehadiranTable';
import { HafalanChecklist } from '@/components/anak/HafalanChecklist';
import { LaporanCard } from '@/components/penilaian/LaporanCard';
import { fmtTgl, calcAge, STATUS_COLOR } from '@/lib/utils';
import { ArrowLeft, User, BookOpen, Calendar, Award } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const tabs = [
  { id: 'data',      label: 'Data Profil',   icon: User },
  { id: 'hafalan',   label: 'Cek Hafalan',   icon: BookOpen },
  { id: 'kehadiran', label: 'Kehadiran',     icon: Calendar },
  { id: 'penilaian', label: 'Raport Semester', icon: Award },
];

export default function AnakDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState('data');
  const [semester, setSemester] = useState('25');

  // Load Child Detail
  const { anak, loading: loadingAnak, error: errorAnak } = useAnakDetail(id);

  // Load Child Attendance History
  const { data: attendanceRes } = useSWR<{ data: any[] }>(
    activeTab === 'kehadiran' && id ? `/api/anakjuara/anak/${id}/kehadiran?semester=${semester}` : null,
    fetcher,
  );
  const attendanceList = attendanceRes?.data ?? [];

  // Load Semester Evaluation details
  const { detail: assessmentDetail, loading: loadingAssess } = usePenilaianDetail(
    activeTab === 'penilaian' ? id : '',
    semester,
  );

  if (loadingAnak) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    );
  }

  if (errorAnak || !anak) {
    return <div style={{ color: '#B02020', padding: 20 }}>Anak asuh tidak ditemukan.</div>;
  }

  const [statusTxt, statusBg] = STATUS_COLOR[String(anak.status_ortu)] || ['#7A6055', '#F2EAE3'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn onClick={() => router.back()} variant="ghost" style={{ padding: 6 }}>
          <ArrowLeft size={18} />
        </Btn>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A0A00' }}>Detail Profil Anak Asuh</h2>
          <span style={{ fontSize: 12, color: '#7A6055' }}>ID Anak: {anak.id_anak}</span>
        </div>
      </div>

      {/* Profile Overview Banner */}
      <div style={{
        background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 18,
        padding: 18, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <Avatar nama={String(anak.nama_lengkap)} gender={String(anak.jns_kel)} size={60} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A0A00' }}>{anak.nama_lengkap}</h3>
          <div style={{ fontSize: 13, color: '#7A6055', marginTop: 3 }}>
            Panggilan: {anak.nama_panggilan || '—'} • {calcAge(anak.tgl_lahir)} Tahun
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            <Badge label={String(anak.status_ortu)} color={statusTxt} bg={statusBg} />
            <Badge label={String(anak.jenjang_pendidikan)} color="#1A5FA8" bg="#E5EEF8" />
            <Badge label={`Asnaf: ${String(anak.asnaf)}`} color="#B87800" bg="#FDF4DC" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span style={{ fontSize: 12, color: '#7A6055', fontWeight: 600 }}>Wilayah Binaan:</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#BF4E02' }}>{anak.nama_wilayah}</span>
        </div>
      </div>

      {/* Tab Switcher & Semester Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F2EAE3', flexWrap: 'wrap' }}>
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab !== 'data' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#7A6055' }}>Semester:</span>
            <Sel value={semester} onChange={e => setSemester(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 180 }}>
              <option value="25">Semester Ganjil 2025/2026</option>
              <option value="26">Semester Genap 2025/2026</option>
            </Sel>
          </div>
        )}
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card>
              <CardHead title="Data Diri & Pendidikan" />
              <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <FLabel>NIK (KTP/KIA)</FLabel>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{anak.nik || '—'}</div>
                </div>
                <div>
                  <FLabel>Tempat, Tanggal Lahir</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.tempat_lahir || '—'}, {fmtTgl(anak.tgl_lahir)}</div>
                </div>
                <div>
                  <FLabel>Agama</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.agama || 'Islam'}</div>
                </div>
                <div>
                  <FLabel>Tinggal Bersama</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.tinggal_bersama || '—'}</div>
                </div>
                <div>
                  <FLabel>Hobi / Kegemaran</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.hobi || '—'}</div>
                </div>
                <div>
                  <FLabel>Prestasi</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.prestasi || '—'}</div>
                </div>
                <div>
                  <FLabel>Sekolah / Lembaga</FLabel>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{anak.nama_sekolah || '—'}</div>
                </div>
                <div>
                  <FLabel>Tingkat / Kelas</FLabel>
                  <div style={{ fontSize: 13 }}>Kelas {anak.kelas || '—'}</div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHead title="Data Orang Tua / Wali" />
              <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <FLabel>Nama Ayah</FLabel>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{anak.nama_lengkap_ayah || '—'}</div>
                  {anak.tanggal_kematian_ayah && <div style={{ fontSize: 11, color: '#B02020', marginTop: 2 }}>Wafat: {fmtTgl(anak.tanggal_kematian_ayah)}</div>}
                </div>
                <div>
                  <FLabel>Pekerjaan Ayah</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.pekerjaan_ayah || '—'}</div>
                </div>
                <div>
                  <FLabel>Nama Ibu</FLabel>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{anak.nama_lengkap_ibu || '—'}</div>
                  {anak.tanggal_kematian_ibu && <div style={{ fontSize: 11, color: '#B02020', marginTop: 2 }}>Wafat: {fmtTgl(anak.tanggal_kematian_ibu)}</div>}
                </div>
                <div>
                  <FLabel>Pekerjaan Ibu</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.pekerjaan_ibu || '—'}</div>
                </div>
                <div>
                  <FLabel>Nama Wali</FLabel>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{anak.nama_lengkap_wali || '—'}</div>
                </div>
                <div>
                  <FLabel>Pekerjaan Wali</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.pekerjaan_wali || '—'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FLabel>Alamat Tinggal</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.alamat || '—'}</div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHead title="Kontak & Informasi Perbankan" />
              <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <FLabel>Telepon Hubung</FLabel>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{anak.telp_yang_bisa_dihubungi || '—'}</div>
                </div>
                <div>
                  <FLabel>Nama Pemilik Rekening</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.pemilik_rekening || '—'}</div>
                </div>
                <div>
                  <FLabel>Nomor Rekening</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.no_rekening || '—'}</div>
                </div>
                <div>
                  <FLabel>Nama Bank</FLabel>
                  <div style={{ fontSize: 13 }}>{anak.nama_bank || '—'}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'hafalan' && (
          <Card>
            <CardHead title="Cek & Update Capaian Hafalan" />
            <div style={{ padding: 18 }}>
              <HafalanChecklist idAnak={id} semester={semester} />
            </div>
          </Card>
        )}

        {activeTab === 'kehadiran' && (
          <Card>
            <CardHead title="Log Sesi & Pembiasaan Mandiri" />
            <div style={{ padding: 14 }}>
              <KehadiranTable data={attendanceList} />
            </div>
          </Card>
        )}

        {activeTab === 'penilaian' && (
          <div>
            {loadingAssess ? (
              <div className="skeleton" style={{ height: 350, borderRadius: 16 }} />
            ) : assessmentDetail?.has_data ? (
              <LaporanCard data={assessmentDetail} />
            ) : (
              <Card style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 14, color: '#7A6055', marginBottom: 12 }}>
                  Raport belum diisi atau disinkronkan untuk semester ini.
                </div>
                <Btn
                  onClick={() => router.push(`/penilaian?semester=${semester}&q=${anak.nama_lengkap}`)}
                  variant="primary"
                >
                  Buka Penilaian
                </Btn>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
