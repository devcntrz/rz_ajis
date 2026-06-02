'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { fmtTgl } from '@/lib/utils';
import type { Pembinaan } from '@/types/pembinaan';

interface PembinaanTableProps {
  data:       Pembinaan[];
  loading:    boolean;
  rowOffset?: number;
  onDeleted?: () => void;
}

export function PembinaanTable({ data, loading, rowOffset = 0, onDeleted }: PembinaanTableProps) {
  const router = useRouter();
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

  const columns = [
    {
      key: 'no',
      label: '#',
      width: 36,
      sticky: true,
      left: 0,
      render: (_r: Pembinaan, i: number) => (
        <span style={{ fontWeight: 700, color: '#7A6055' }}>{rowOffset + i + 1}</span>
      ),
    },
    {
      key: 'tgl_pembinaan',
      label: 'Tanggal',
      width: 110,
      sticky: true,
      left: 36,
      render: (r: Pembinaan) => <span style={{ fontWeight: 700 }}>{fmtTgl(r.tgl_pembinaan)}</span>,
    },
    {
      key: 'materi',
      label: 'Tema Materi & Pemateri',
      width: 280,
      sticky: true,
      left: 146,
      sep: true,
      render: (r: Pembinaan) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1A0A00' }}>{r.judul_materi || '—'}</div>
          <div style={{ fontSize: 11, color: '#7A6055' }}>Pemateri: {r.pemateri || '—'}</div>
        </div>
      ),
    },
    {
      key: 'jenis_pembinaan',
      label: 'Jenis Pembinaan',
      width: 160,
      render: (r: Pembinaan) => <span>{r.jenis_pembinaan}</span>,
    },
    {
      key: 'semester',
      label: 'Semester',
      width: 90,
      render: (r: Pembinaan) => (
        <span>{r.semester_label || `Semester ${r.semesterid}`}</span>
      ),
    },
    {
      key: 'wilayah',
      label: 'Wilayah',
      width: 140,
      render: (r: Pembinaan) => <span>{r.nama_wilayah}</span>,
    },
    {
      key: 'kehadiran',
      label: 'Kehadiran',
      width: 130,
      render: (r: Pembinaan) => {
        const pct = r.jumlah_anak > 0 ? Math.round((r.jumlah_hadir / r.jumlah_anak) * 100) : 0;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>
              <span>{r.jumlah_hadir} / {r.jumlah_anak} Anak</span>
              <span style={{ color: '#BF4E02' }}>{pct}%</span>
            </div>
            <div style={{ height: 5, background: '#F2EAE3', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#BF4E02' }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'action',
      label: '',
      width: 46,
      render: (r: Pembinaan) => (
        <button
          title="Hapus sesi"
          onClick={e => { e.stopPropagation(); setTarget(r); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#B02020', padding: '4px 6px', borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FDEAEA'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        rowKey={r => r.id_pembinaan}
        loading={loading}
        onRowClick={r => router.push(`/pembinaan/${r.id_pembinaan}`)}
        minWidth={960}
      />

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
    </>
  );
}
