'use client';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { fmtTgl, STATUS_COLOR } from '@/lib/utils';
import type { CalonAnakJuaraRow } from '@/types/calon-anak-juara';

interface Props {
  data: CalonAnakJuaraRow[];
  loading: boolean;
  rowOffset?: number;
  onPdfSurat: (row: CalonAnakJuaraRow) => void;
  onPdfCv: (row: CalonAnakJuaraRow) => void;
  onPasangDonatur: (row: CalonAnakJuaraRow) => void;
}

export function CalonAnakJuaraTable({
  data, loading, rowOffset = 0, onPdfSurat, onPdfCv, onPasangDonatur,
}: Props) {
  return (
    <DataTable
      rowKey={r => r.id_anak}
      data={data}
      loading={loading}
      emptyText="Tidak ada Calon Anak Juara."
      rowNumberStart={rowOffset + 1}
      stickyHeader
      columns={[
        {
          key: 'aksi',
          label: '',
          width: 52,
          sticky: true,
          render: (r: CalonAnakJuaraRow) => (
            <RowActions
              label={`Aksi untuk ${r.nama_lengkap}`}
              items={[
                { label: 'Pasang ke Donatur', onClick: () => onPasangDonatur(r) },
                { label: 'PDF Surat', onClick: () => onPdfSurat(r) },
                { label: 'PDF CV', onClick: () => onPdfCv(r) },
              ]}
            />
          ),
        },
        {
          key: 'nama_lengkap',
          label: 'Nama Calon Anak Juara',
          width: 240,
          sticky: true,
          sep: true,
          render: (r: CalonAnakJuaraRow) => (
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1A0A00' }}>{r.nama_lengkap}</div>
              <div style={{ fontSize: 11, color: '#7A6055' }}>{r.id_anak}</div>
            </div>
          ),
        },
        {
          key: 'kelas',
          label: 'Kelas',
          width: 70,
          render: (r: CalonAnakJuaraRow) => r.kelas || '—',
        },
        {
          key: 'status_ortu',
          label: 'Status',
          width: 120,
          render: (r: CalonAnakJuaraRow) => {
            const [txt, bg] = STATUS_COLOR[r.status_ortu] || ['#7A6055', '#F2EAE3'];
            return <Badge label={r.status_ortu || '—'} color={txt} bg={bg} />;
          },
        },
        {
          key: 'jenjang',
          label: 'Jenjang',
          width: 90,
          render: (r: CalonAnakJuaraRow) => r.jenjang_pendidikan || '—',
        },
        {
          key: 'tgl_peminjaman',
          label: 'Tgl Peminjaman',
          width: 120,
          render: (r: CalonAnakJuaraRow) => fmtTgl(r.tgl_peminjaman),
        },
        {
          key: 'nia_rfo_book',
          label: 'NIA RFO',
          width: 130,
          render: (r: CalonAnakJuaraRow) => r.nia_rfo_book || '—',
        },
        {
          key: 'nama_rfo_book',
          label: 'Nama RFO',
          width: 180,
          render: (r: CalonAnakJuaraRow) => r.nama_rfo_book || '—',
        },
        {
          key: 'book_via',
          label: 'Book Via',
          width: 90,
          render: (r: CalonAnakJuaraRow) => r.book_via || '—',
        },
        {
          key: 'user_book',
          label: 'User Insert',
          width: 120,
          render: (r: CalonAnakJuaraRow) => r.user_book || '—',
        },
        {
          key: 'tgl_terdaftar',
          label: 'Tanggal Terdaftar',
          width: 130,
          render: (r: CalonAnakJuaraRow) => fmtTgl(r.tgl_terdaftar),
        },
        {
          key: 'nama_kantor',
          label: 'Kantor',
          width: 160,
          render: (r: CalonAnakJuaraRow) => r.nama_kantor || '—',
        },
        {
          key: 'nama_wilayah',
          label: 'Wilayah Pembinaan',
          width: 180,
          render: (r: CalonAnakJuaraRow) => r.nama_wilayah || '—',
        },
        {
          key: 'status_pinjam',
          label: 'Status Pinjam',
          width: 110,
          render: (r: CalonAnakJuaraRow) => (
            <Badge
              label={r.status_pinjam === 'y' ? 'Y' : 'N'}
              color={r.status_pinjam === 'y' ? '#1A7A45' : '#7A6055'}
              bg={r.status_pinjam === 'y' ? '#E5F5ED' : '#F2EAE3'}
            />
          ),
        },
        {
          key: 'alamat',
          label: 'Alamat',
          width: 240,
          render: (r: CalonAnakJuaraRow) => r.alamat || '—',
        },
      ]}
    />
  );
}
