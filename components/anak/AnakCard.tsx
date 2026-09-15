'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { RowActions } from '@/components/ui/RowActions';
import { STATUS_COLOR, calcAge } from '@/lib/utils';
import { anakFotoUrl } from '@/lib/anakFotoUrl';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { AnakListRow } from '@/types/anak';

interface AnakCardProps {
  data: AnakListRow[];
  rowOffset?: number;
  loading?: boolean;
}

export function AnakCard({ data, rowOffset = 0, loading }: AnakCardProps) {
  const router = useRouter();

  if (loading && data.length === 0) {
    return (
      <div className="datagrid-mobile">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 88, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="datagrid-mobile" style={{ padding: 24, textAlign: 'center', color: '#7A6055', fontSize: 14 }}>
        Tidak ada data anak asuh.
      </div>
    );
  }

  return (
    <div className="datagrid-mobile">
      {data.map((r, i) => {
        const [txt, bg] = STATUS_COLOR[r.status_ortu] || ['#7A6055', '#F2EAE3'];
        const fotoUrl = anakFotoUrl(r.foto);
        return (
          <Link key={r.id_anak} href={`/anak/${r.id_anak}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
              padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7A6055', minWidth: 22 }}>
                  #{rowOffset + i + 1}
                </span>
                {fotoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={fotoUrl} alt={r.nama_lengkap} width={40} height={40} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  : <Avatar nama={r.nama_lengkap} gender={r.jns_kel} size={40} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>
                    <Badge label={r.status_ortu} color={txt} bg={bg} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.nama_lengkap}
                  </div>
                  <div style={{ fontSize: 11, color: '#7A6055' }}>Panggilan: {r.nama_panggilan || '—'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, fontSize: 12, color: '#1A0A00' }}>
                <div><span style={{ color: '#7A6055' }}>Jenjang:</span> {r.jenjang_pendidikan || '—'}</div>
                <div><span style={{ color: '#7A6055' }}>Kelas:</span> {r.kelas || '—'}</div>
                <div><span style={{ color: '#7A6055' }}>Usia:</span> {calcAge(r.tgl_lahir)} Thn</div>
                <div><span style={{ color: '#7A6055' }}>JK:</span> {r.jns_kel?.toUpperCase() || '—'}</div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#7A6055' }}>Sekolah:</span> {r.nama_sekolah || '—'}</div>
                <div><span style={{ color: '#7A6055' }}>Wilayah:</span> {r.nama_wilayah || '—'}</div>
                <div><span style={{ color: '#7A6055' }}>Kantor:</span> {r.nama_kantor || '—'}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                {fotoUrl
                  ? <Badge label="Foto Ada" color="#1A7A45" bg="#E5F5ED" icon={CheckCircle2} />
                  : <Badge label="Foto Belum" color="#B02020" bg="#FDEAEA" icon={XCircle} />}
                <span onClick={e => e.preventDefault()}>
                  <RowActions
                    label={`Aksi untuk ${r.nama_lengkap}`}
                    items={[
                      { label: 'Edit', onClick: () => router.push(`/anak/${r.id_anak}?edit=1`) },
                      { label: 'Survey', onClick: () => router.push(`/survey?id_anak=${encodeURIComponent(r.id_anak)}`) },
                    ]}
                  />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
