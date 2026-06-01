'use client';
import { useParams, useRouter } from 'next/navigation';
import { usePembinaanDetail } from '@/hooks/usePembinaan';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Badge } from '@/components/ui/Badge';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { fmtTgl, HADIR_COLOR } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Calendar, ClipboardCheck } from 'lucide-react';
import { useTransition } from 'react';

export default function PembinaanDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { session, loading, error, mutate } = usePembinaanDetail(id);
  const [isPending, startTransition] = useTransition();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 140, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 350, borderRadius: 16 }} />
      </div>
    );
  }

  if (error || !session) {
    return <div style={{ color: '#B02020', padding: 20 }}>Sesi pembinaan tidak ditemukan.</div>;
  }

  async function handleDelete() {
    if (!confirm('Apakah Anda yakin ingin menghapus sesi pembinaan ini beserta absensinya?')) return;

    try {
      const res = await fetch(`/api/anakjuara/pembinaan/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();

      alert('Sesi pembinaan berhasil dihapus.');
      startTransition(() => {
        router.push('/pembinaan');
        router.refresh();
      });
    } catch {
      alert('Gagal menghapus sesi pembinaan.');
    }
  }

  const attendanceTotal = session.anak.length;
  const hadirCount = session.anak.filter(a => a.kehadiran === 'y').length;
  const pct = attendanceTotal > 0 ? Math.round((hadirCount / attendanceTotal) * 100) : 0;
  const isParenting = session.jenis_pembinaan === 'Parenting';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Btn onClick={() => router.back()} variant="ghost" style={{ padding: 6 }}>
            <ArrowLeft size={18} />
          </Btn>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A0A00' }}>Detail Sesi Pembinaan</h2>
            <span style={{ fontSize: 12, color: '#7A6055' }}>ID Sesi: {session.id_pembinaan}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <Btn onClick={() => router.push(`/pembinaan/${id}/edit`)} variant="outline">
            <Edit size={14} />
            <span>Edit</span>
          </Btn>
          <Btn onClick={handleDelete} variant="danger">
            <Trash2 size={14} />
            <span>Hapus</span>
          </Btn>
        </div>
      </div>

      {/* Sesi Detail */}
      <Card>
        <CardHead title="Informasi Materi & Pelaksanaan" icon={Calendar} />
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div>
            <FLabel>Tanggal Pelaksanaan</FLabel>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{fmtTgl(session.tgl_pembinaan)}</div>
          </div>
          <div>
            <FLabel>Jenis Pembinaan</FLabel>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{session.jenis_pembinaan}</div>
          </div>
          <div>
            <FLabel>Pemateri / Narasumber</FLabel>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{session.pemateri || '—'}</div>
          </div>
          <div>
            <FLabel>Semester</FLabel>
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              {(session as { semester_label?: string }).semester_label || `Semester ${session.semesterid}`}
            </div>
          </div>
          {session.jenis_pembinaan === 'P3A' && (session as { p3a?: string }).p3a && (
            <div style={{ gridColumn: '1 / -1' }}>
              <FLabel>Keterangan P3A</FLabel>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{(session as { p3a?: string }).p3a}</div>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <FLabel>Tema Utama Materi</FLabel>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#BF4E02' }}>{session.judul_materi || '—'}</div>
          </div>
        </div>
      </Card>

      {/* Kehadiran Summary Banner */}
      <div style={{
        background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
        padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 12, color: '#7A6055', fontWeight: 600 }}>Rata-Rata Tingkat Kehadiran:</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#BF4E02', marginTop: 2 }}>{pct}%</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#7A6055', fontWeight: 600 }}>Rasio Kehadiran:</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A0A00', marginTop: 2 }}>{hadirCount} dari {attendanceTotal} Anak Hadir</div>
        </div>
      </div>

      {/* Attendance Matrix Details Table */}
      <Card>
        <CardHead title="Hasil Absensi & Penilaian Mandiri" icon={ClipboardCheck} />
        <div style={{ padding: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Anak Asuh</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center', width: 110 }}>Absensi</th>
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left', width: 160 }}>Keterangan</th>
                {isParenting && (
                  <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center', width: 90 }}>Ortu Hadir</th>
                )}
                <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center' }}>Pembiasaan Mandiri</th>
              </tr>
            </thead>
            <tbody>
              {session.anak.map((anak, i) => {
                const statusLabel = anak.kehadiran === 'y' ? 'Hadir' : (anak.keterangan || 'Alfa');
                const statusKey = anak.kehadiran === 'y' ? 'hadir' : (anak.keterangan?.toLowerCase().includes('izin') ? 'izin' : 'alfa');
                const [txt, bg] = HADIR_COLOR[statusKey] || ['#7A6055', '#F2EAE3'];

                return (
                  <tr key={anak.id_anak} style={{ borderBottom: '1px solid #F2EAE3' }}>
                    <td style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar nama={anak.nama_lengkap} gender={anak.jns_kel} size={28} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#1A0A00' }}>{anak.nama_lengkap}</div>
                        <div style={{ fontSize: 11, color: '#7A6055' }}>{anak.id_anak} • {anak.jenjang_pendidikan}</div>
                      </div>
                    </td>
                    <td style={{ padding: 10, textAlign: 'center' }}>
                      <Badge label={statusLabel} color={txt} bg={bg} />
                    </td>
                    <td style={{ padding: 10, color: '#7A6055' }}>
                      {anak.kehadiran === 'y' ? '—' : (anak.keterangan || 'Tanpa Keterangan')}
                    </td>
                    {isParenting && (
                      <td style={{ padding: 10, textAlign: 'center', textTransform: 'capitalize' }}>
                        {anak.kehadiran === 'y' ? (anak.ortu_hadir || '—') : '—'}
                      </td>
                    )}
                    <td style={{ padding: 10, verticalAlign: 'middle' }}>
                      {anak.kehadiran === 'y' ? (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: anak.pembiasaan_shalat_wajib ? '#E5F5ED' : '#FDEAEA', color: anak.pembiasaan_shalat_wajib ? '#1A7A45' : '#B02020' }}>Shalat</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: anak.pembiasaan_tilawah ? '#E5F5ED' : '#FDEAEA', color: anak.pembiasaan_tilawah ? '#1A7A45' : '#B02020' }}>Tilawah</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: anak.pembiasaan_sedekah ? '#E5F5ED' : '#FDEAEA', color: anak.pembiasaan_sedekah ? '#1A7A45' : '#B02020' }}>Sedekah</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: anak.membantu_ortu ? '#E5F5ED' : '#FDEAEA', color: anak.membantu_ortu ? '#1A7A45' : '#B02020' }}>Bantu Ortu</span>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#7A6055', fontSize: 11 }}>—</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
