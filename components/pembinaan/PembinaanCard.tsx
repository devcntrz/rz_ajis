'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { fmtTgl } from '@/lib/utils';
import type { Pembinaan } from '@/types/pembinaan';

interface PembinaanCardProps {
  data:       Pembinaan[];
  onDeleted?: () => void;
}

export function PembinaanCard({ data, onDeleted }: PembinaanCardProps) {
  const [target, setTarget] = useState<Pembinaan | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/anakjuara/pembinaan/${target.id_pembinaan}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Gagal menghapus.');
      toast.success(`Sesi "${target.judul_materi || target.id_pembinaan}" berhasil dihapus.`);
      setTarget(null);
      onDeleted?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan saat menghapus.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="datagrid-mobile">
      {data.map(r => {
        const pct = r.jumlah_anak > 0 ? Math.round((r.jumlah_hadir / r.jumlah_anak) * 100) : 0;
        return (
          <div key={r.id_pembinaan} style={{ position: 'relative' }}>
            <Link href={`/pembinaan/${r.id_pembinaan}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
                padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#7A6055' }}>
                    {fmtTgl(r.tgl_pembinaan)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#FBF0E8', color: '#BF4E02' }}>
                      {r.semester_label || `Sem ${r.semesterid}`}
                    </span>
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setTarget(r); }}
                      style={{
                        background: '#FDEAEA', border: 'none', cursor: 'pointer',
                        color: '#B02020', padding: '4px 6px', borderRadius: 6,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', lineHeight: 1.3 }}>
                    {r.judul_materi || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#7A6055', marginTop: 2 }}>
                    Materi: {r.jenis_pembinaan} • {r.pemateri}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F2EAE3', paddingTop: 8, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: '#7A6055' }}>Kehadiran</span>
                    <span style={{ color: '#BF4E02' }}>{r.jumlah_hadir} / {r.jumlah_anak} Hadir ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#F2EAE3', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#BF4E02' }} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}

      <Modal open={!!target} onClose={() => !deleting && setTarget(null)} title="Hapus Sesi Pembinaan">
        <p style={{ fontSize: 14, color: '#1A0A00', marginBottom: 6 }}>
          Anda akan menghapus sesi:
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#B02020', marginBottom: 6 }}>
          &ldquo;{target?.judul_materi || target?.id_pembinaan}&rdquo;
        </p>
        <p style={{ fontSize: 13, color: '#7A6055', marginBottom: 20 }}>
          Tindakan ini akan menghapus seluruh data kehadiran ({target?.jumlah_anak ?? 0} anak) pada sesi ini dan tidak bisa dibatalkan.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn type="button" variant="outline" onClick={() => setTarget(null)} disabled={deleting}>
            Batal
          </Btn>
          <Btn
            type="button"
            variant="primary"
            disabled={deleting}
            onClick={confirmDelete}
            style={{ background: '#B02020', borderColor: '#B02020' }}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
