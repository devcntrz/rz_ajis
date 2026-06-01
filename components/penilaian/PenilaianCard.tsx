'use client';
import { Badge } from '@/components/ui/Badge';
import { Btn } from '@/components/ui/Btn';
import { Edit2, Eye, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PenilaianRow {
  id_anak:            string;
  nama_lengkap:       string;
  jenjang_pendidikan: string;
  nama_wilayah:       string;
  nama_kantor:        string;
  record_count:       number;
  nilai_capaian_avg:  number;
}

interface PenilaianCardProps {
  data:     PenilaianRow[];
  semester: string;
  onSync:   (idAnak: string) => Promise<void>;
}

export function PenilaianCard({ data, semester, onSync }: PenilaianCardProps) {
  const router = useRouter();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  return (
    <div className="datagrid-mobile" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
      {data.map(r => {
        const hasData = r.record_count > 0;
        const avg = Math.round(Number(r.nilai_capaian_avg || 0));
        const isSyncing = syncingId === r.id_anak;

        return (
          <div key={r.id_anak} style={{
            background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
            padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#BF4E02' }}>{r.id_anak}</span>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1A0A00', marginTop: 1 }}>{r.nama_lengkap}</div>
                <div style={{ fontSize: 12, color: '#7A6055' }}>{r.jenjang_pendidikan} • {r.nama_wilayah}</div>
              </div>
              <Badge
                label={hasData ? 'Sudah Diisi' : 'Belum Diisi'}
                color={hasData ? '#1A7A45' : '#B02020'}
                bg={hasData ? '#E5F5ED' : '#FDEAEA'}
              />
            </div>

            {hasData && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAF8', padding: '6px 10px', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#7A6055', fontWeight: 600 }}>Rata-Rata Capaian:</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#BF4E02' }}>{avg}%</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid #F2EAE3', paddingTop: 10, marginTop: 4 }}>
              {hasData ? (
                <>
                  <Btn
                    onClick={() => router.push(`/penilaian/${r.id_anak}/${semester}`)}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Eye size={12} />
                    <span>Lihat</span>
                  </Btn>
                  <Btn
                    onClick={() => router.push(`/penilaian/${r.id_anak}/${semester}/edit`)}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </Btn>
                </>
              ) : (
                <Btn
                  onClick={async () => {
                    setSyncingId(r.id_anak);
                    await onSync(r.id_anak);
                    setSyncingId(null);
                  }}
                  disabled={isSyncing}
                  variant="primary"
                  size="sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync & Isi Awal'}</span>
                </Btn>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
