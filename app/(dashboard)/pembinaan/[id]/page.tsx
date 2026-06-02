'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usePembinaanDetail } from '@/hooks/usePembinaan';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Badge } from '@/components/ui/Badge';
import { Btn } from '@/components/ui/Btn';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { AttendanceMatrix } from '@/components/pembinaan/AttendanceMatrix';
import { fmtTgl, HADIR_COLOR } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Calendar, ClipboardCheck, Save, X } from 'lucide-react';
import type { Mandiri, PembinaanAnakRow } from '@/types/pembinaan';

export default function PembinaanDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { session, loading, error, mutate } = usePembinaanDetail(id);

  /* ── delete confirm ── */
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── inline edit state ── */
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kehadiran, setKehadiran] = useState<Record<string, 'y' | 'n'>>({});
  const [keterangan, setKeterangan] = useState<Record<string, string>>({});
  const [mandiri, setMandiri] = useState<Record<string, Mandiri>>({});
  const [ortuHadir, setOrtuHadir] = useState<Record<string, string>>({});

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

  const sess = session;
  const isParenting = sess.jenis_pembinaan === 'Parenting';

  /* ── enter edit mode: copy current data into draft state ── */
  function enterEditMode() {
    const kh: Record<string, 'y' | 'n'> = {};
    const kt: Record<string, string> = {};
    const md: Record<string, Mandiri> = {};
    const oh: Record<string, string> = {};

    sess.anak.forEach(a => {
      kh[a.id_anak] = (a.kehadiran as 'y' | 'n') ?? 'y';
      kt[a.id_anak] = a.keterangan || 'Alfa';
      md[a.id_anak] = {
        shalat_wajib: !!a.pembiasaan_shalat_wajib,
        tilawah:      !!a.pembiasaan_tilawah,
        sedekah:      !!a.pembiasaan_sedekah,
        bantu_ortu:   !!a.membantu_ortu,
      };
      oh[a.id_anak] = a.ortu_hadir || '';
    });

    setKehadiran(kh);
    setKeterangan(kt);
    setMandiri(md);
    setOrtuHadir(oh);
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
  }

  async function saveAttendance() {
    setSaving(true);
    try {
      const payloadKehadiran: Record<string, { hadir: 'y' | 'n'; keterangan: string }> = {};
      const payloadMandiri: Record<string, Mandiri> = {};
      const payloadOrtu: Record<string, string> = {};

      sess.anak.forEach(a => {
        const hadir = kehadiran[a.id_anak] ?? 'y';
        payloadKehadiran[a.id_anak] = {
          hadir,
          keterangan: hadir === 'y' ? '' : (keterangan[a.id_anak] || 'Alfa'),
        };
        payloadMandiri[a.id_anak] = mandiri[a.id_anak] || {
          shalat_wajib: false, tilawah: false, sedekah: false, bantu_ortu: false,
        };
        payloadOrtu[a.id_anak] = isParenting && hadir === 'y' ? (ortuHadir[a.id_anak] || '') : '';
      });

      const res = await fetch(`/api/anakjuara/pembinaan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kehadiran: payloadKehadiran,
          mandiri:   payloadMandiri,
          ortu_hadir: payloadOrtu,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Gagal menyimpan.');
      toast.success('Kehadiran berhasil diperbarui!');
      setEditMode(false);
      mutate();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/anakjuara/pembinaan/${id}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Gagal menghapus.');
      toast.success('Sesi pembinaan berhasil dihapus.');
      router.push('/pembinaan');
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan saat menghapus.');
      setDeleting(false);
    }
  }

  const attendanceTotal = sess.anak.length;
  const hadirCount = sess.anak.filter(a => a.kehadiran === 'y').length;
  const pct = attendanceTotal > 0 ? Math.round((hadirCount / attendanceTotal) * 100) : 0;

  /* matrix anak list shape — add required id_row and id_pembinaan */
  const anakList: PembinaanAnakRow[] = sess.anak.map(a => ({
    id_row:            a.id_row,
    id_pembinaan:      sess.id_pembinaan,
    id_anak:           a.id_anak,
    nama_lengkap:      a.nama_lengkap,
    jenjang_pendidikan: a.jenjang_pendidikan,
    jns_kel:           a.jns_kel,
    status_ortu:       a.status_ortu,
    kehadiran:         (a.kehadiran as 'y' | 'n'),
    keterangan:        a.keterangan,
    ortu_hadir:        a.ortu_hadir,
    pembiasaan_shalat_wajib: a.pembiasaan_shalat_wajib,
    pembiasaan_tilawah:      a.pembiasaan_tilawah,
    pembiasaan_sedekah:      a.pembiasaan_sedekah,
    membantu_ortu:           a.membantu_ortu,
  }));

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
            <span style={{ fontSize: 12, color: '#7A6055' }}>ID Sesi: {sess.id_pembinaan}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <Btn onClick={() => router.push(`/pembinaan/${id}/edit`)} variant="outline">
            <Edit size={14} />
            <span>Edit Info</span>
          </Btn>
          <Btn onClick={() => setShowDelete(true)} variant="danger">
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
            <div style={{ fontSize: 14, fontWeight: 800 }}>{fmtTgl(sess.tgl_pembinaan)}</div>
          </div>
          <div>
            <FLabel>Jenis Pembinaan</FLabel>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{sess.jenis_pembinaan}</div>
          </div>
          <div>
            <FLabel>Pemateri / Narasumber</FLabel>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{sess.pemateri || '—'}</div>
          </div>
          <div>
            <FLabel>Semester</FLabel>
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              {(session as { semester_label?: string }).semester_label || `Semester ${sess.semesterid}`}
            </div>
          </div>
          {sess.jenis_pembinaan === 'P3A' && (session as { p3a?: string }).p3a && (
            <div style={{ gridColumn: '1 / -1' }}>
              <FLabel>Keterangan P3A</FLabel>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{(session as { p3a?: string }).p3a}</div>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <FLabel>Tema Utama Materi</FLabel>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#BF4E02' }}>{sess.judul_materi || '—'}</div>
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

      {/* Attendance — READ or EDIT mode */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F2EAE3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardCheck size={16} color="#BF4E02" />
            <span style={{ fontWeight: 800, fontSize: 15, color: '#1A0A00' }}>
              {editMode ? 'Edit Kehadiran & Pembiasaan' : 'Hasil Absensi & Penilaian Mandiri'}
            </span>
          </div>
          {!editMode && (
            <Btn onClick={enterEditMode} variant="outline" size="sm">
              <Edit size={13} />
              <span>Edit Kehadiran</span>
            </Btn>
          )}
        </div>

        {editMode ? (
          /* ── EDIT MODE ── */
          <div style={{ padding: 14 }}>
            <AttendanceMatrix
              anakList={anakList}
              kehadiran={kehadiran}
              keterangan={keterangan}
              mandiri={mandiri}
              ortuHadir={ortuHadir}
              showParenting={isParenting}
              onChange={(kh, kt, md, oh) => {
                setKehadiran(kh);
                setKeterangan(kt);
                setMandiri(md);
                if (oh) setOrtuHadir(oh);
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <Btn type="button" variant="outline" onClick={cancelEdit} disabled={saving}>
                <X size={14} />
                <span>Batal</span>
              </Btn>
              <Btn type="button" variant="primary" onClick={saveAttendance} disabled={saving}>
                <Save size={14} />
                <span>{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
              </Btn>
            </div>
          </div>
        ) : (
          /* ── READ MODE ── */
          <div style={{ padding: 10, overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
                  <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left' }}>Anak Asuh</th>
                  <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center', width: 110 }}>Absensi</th>
                  <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'left', width: 100 }}>Keterangan</th>
                  {isParenting && (
                    <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center', width: 90 }}>Ortu Hadir</th>
                  )}
                  <th style={{ padding: 10, fontWeight: 700, color: '#8F3A01', textAlign: 'center' }}>Pembiasaan Mandiri</th>
                </tr>
              </thead>
              <tbody>
                {sess.anak.map((anak, i) => {
                  const ket = anak.keterangan || 'Alfa';
                  const statusKey = anak.kehadiran === 'y' ? 'hadir' : (ket === 'Izin' ? 'izin' : ket === 'Sakit' ? 'sakit' : 'alfa');
                  const statusLabel = anak.kehadiran === 'y' ? 'Hadir' : ket;
                  const [txt, bg] = HADIR_COLOR[statusKey] || ['#7A6055', '#F2EAE3'];

                  return (
                    <tr key={anak.id_anak} style={{ borderBottom: '1px solid #F2EAE3', background: i % 2 === 0 ? '#FFFFFF' : '#FDFAF8' }}>
                      <td style={{ padding: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar nama={anak.nama_lengkap} gender={anak.jns_kel} size={28} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#1A0A00' }}>{anak.nama_lengkap}</div>
                            <div style={{ fontSize: 11, color: '#7A6055' }}>{anak.id_anak} • {anak.jenjang_pendidikan}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 10, textAlign: 'center' }}>
                        <Badge label={statusLabel} color={txt} bg={bg} />
                      </td>
                      <td style={{ padding: 10, color: '#7A6055' }}>
                        {anak.kehadiran === 'y' ? '—' : ket}
                      </td>
                      {isParenting && (
                        <td style={{ padding: 10, textAlign: 'center', textTransform: 'capitalize' }}>
                          {anak.kehadiran === 'y' ? (anak.ortu_hadir || '—') : '—'}
                        </td>
                      )}
                      <td style={{ padding: 10 }}>
                        {anak.kehadiran === 'y' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            {[
                              { key: 'pembiasaan_shalat_wajib', label: 'Shalat' },
                              { key: 'pembiasaan_tilawah',      label: 'Tilawah' },
                              { key: 'pembiasaan_sedekah',      label: 'Sedekah' },
                              { key: 'membantu_ortu',           label: 'Bantu Ortu' },
                            ].map(({ key, label }) => {
                              const on = !!(anak as unknown as Record<string, unknown>)[key];
                              return (
                                <span key={key} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: on ? '#E5F5ED' : '#FDEAEA', color: on ? '#1A7A45' : '#B02020' }}>
                                  {label}
                                </span>
                              );
                            })}
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
        )}
      </Card>

      {/* Delete confirm modal */}
      <Modal open={showDelete} onClose={() => !deleting && setShowDelete(false)} title="Hapus Sesi Pembinaan" maxWidth={440}>
        <p style={{ fontSize: 14, color: '#1A0A00', marginBottom: 6 }}>
          Anda akan menghapus sesi:
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#B02020', marginBottom: 6 }}>
          &ldquo;{sess.judul_materi || sess.id_pembinaan}&rdquo;
        </p>
        <p style={{ fontSize: 13, color: '#7A6055', marginBottom: 20 }}>
          Tindakan ini akan menghapus seluruh data kehadiran ({sess.anak.length} anak) dan tidak bisa dibatalkan.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn type="button" variant="outline" onClick={() => setShowDelete(false)} disabled={deleting}>
            Batal
          </Btn>
          <Btn
            type="button"
            variant="primary"
            onClick={confirmDelete}
            disabled={deleting}
            style={{ background: '#B02020', borderColor: '#B02020' }}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
