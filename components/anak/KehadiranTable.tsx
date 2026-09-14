'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fmtTgl } from '@/lib/utils';
import { Input, Sel } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';

export interface KehadiranRow {
  id_row: number;
  id_anak: string;
  id_pembinaan: string;
  tgl_pembinaan: string;
  semesterid: string;
  jenis_pembinaan: string;
  judul_materi: string;
  pemateri: string;
  kehadiran: string;
  keterangan: string;
  membantu_ortu: number;
  pembiasaan_shalat_wajib: number;
  pembiasaan_tilawah: number;
  pembiasaan_sedekah: number;
}

type StatusOpt = 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';

function statusOf(r: Pick<KehadiranRow, 'kehadiran' | 'keterangan'>): StatusOpt {
  if (r.kehadiran === 'y') return 'Hadir';
  const k = (r.keterangan || '').toLowerCase();
  if (k.includes('izin')) return 'Izin';
  if (k.includes('sakit')) return 'Sakit';
  return 'Alfa';
}

interface Props {
  data: KehadiranRow[];
  idAnak: string;
  onSaved?: () => void;
}

export function KehadiranTable({ data, idAnak, onSaved }: Props) {
  const [rows, setRows] = useState(data);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { setRows(data); }, [data]);

  if (rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#7A6055', fontSize: 13 }}>
        Belum ada riwayat pembinaan di semester ini.
      </div>
    );
  }

  async function save(next: KehadiranRow) {
    const key = String(next.id_row || next.id_pembinaan);
    setSaving(key);
    const res = await fetch(`/api/anakjuara/anak/${encodeURIComponent(idAnak)}/kehadiran`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_row: next.id_row,
        id_pembinaan: next.id_pembinaan,
        id_anak: next.id_anak || idAnak,
        kehadiran: next.kehadiran,
        keterangan: next.keterangan,
        mandiri: {
          bantu_ortu: !!next.membantu_ortu,
          shalat_wajib: !!next.pembiasaan_shalat_wajib,
          tilawah: !!next.pembiasaan_tilawah,
          sedekah: !!next.pembiasaan_sedekah,
        },
      }),
    });
    const json = await res.json();
    setSaving(null);
    if (!res.ok) {
      toast.error(json.error || 'Gagal menyimpan kehadiran.');
      return;
    }
    toast.success('Kehadiran disimpan.');
    onSaved?.();
  }

  function patch(index: number, update: Partial<KehadiranRow>, persist = true) {
    setRows(prev => {
      const next = prev.map((r, i) => i === index ? { ...r, ...update } : r);
      if (persist) void save(next[index]);
      return next;
    });
  }

  function setStatus(index: number, status: StatusOpt) {
    const hadir = status === 'Hadir' ? 'y' : 'n';
    patch(index, {
      kehadiran: hadir,
      keterangan: hadir === 'y' ? '' : status,
    });
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ minWidth: 860, fontSize: 13, width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F2EAE3', color: '#7A6055', fontWeight: 700 }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Tanggal</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Materi</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Jenis</th>
            <th style={{ padding: 10, textAlign: 'left', width: 120 }}>Status</th>
            <th style={{ padding: 10, textAlign: 'center' }}>Pembiasaan Mandiri</th>
            <th style={{ padding: 10, textAlign: 'left', width: 180 }}>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const key = String(r.id_row || r.id_pembinaan || i);
            const hadir = r.kehadiran === 'y';
            const busy = saving === key;
            return (
              <tr key={key} style={{ borderBottom: '1px solid #F2EAE3', opacity: busy ? 0.65 : 1 }}>
                <td style={{ padding: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtTgl(r.tgl_pembinaan)}</td>
                <td style={{ padding: 10 }}>
                  <div style={{ fontWeight: 700, color: '#1A0A00' }}>{r.judul_materi || '—'}</div>
                  <div style={{ fontSize: 11, color: '#7A6055' }}>Pemateri: {r.pemateri || '—'}</div>
                </td>
                <td style={{ padding: 10 }}>{r.jenis_pembinaan}</td>
                <td style={{ padding: 10 }}>
                  <Sel
                    value={statusOf(r)}
                    disabled={busy}
                    onChange={e => setStatus(i, e.target.value as StatusOpt)}
                    style={{ padding: '6px 8px', fontSize: 12 }}
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alfa">Alfa</option>
                  </Sel>
                </td>
                <td style={{ padding: 10, verticalAlign: 'middle' }}>
                  <div style={{
                    display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
                    pointerEvents: busy ? 'none' : 'auto', opacity: busy ? 0.6 : 1,
                  }}>
                    <Toggle
                      value={!!r.pembiasaan_shalat_wajib}
                      onChange={v => patch(i, { pembiasaan_shalat_wajib: v ? 1 : 0 })}
                      label="Shalat"
                    />
                    <Toggle
                      value={!!r.pembiasaan_tilawah}
                      onChange={v => patch(i, { pembiasaan_tilawah: v ? 1 : 0 })}
                      label="Tilawah"
                    />
                    <Toggle
                      value={!!r.pembiasaan_sedekah}
                      onChange={v => patch(i, { pembiasaan_sedekah: v ? 1 : 0 })}
                      label="Sedekah"
                    />
                    <Toggle
                      value={!!r.membantu_ortu}
                      onChange={v => patch(i, { membantu_ortu: v ? 1 : 0 })}
                      label="Bantu Ortu"
                    />
                  </div>
                </td>
                <td style={{ padding: 10 }}>
                  <Input
                    value={hadir ? '' : (r.keterangan || '')}
                    disabled={busy || hadir}
                    placeholder={hadir ? '—' : 'Keterangan'}
                    onChange={e => patch(i, { keterangan: e.target.value }, false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void save({ ...r, keterangan: (e.target as HTMLInputElement).value });
                      }
                    }}
                    onBlur={e => {
                      if (!hadir && e.target.value !== (data[i]?.keterangan || '')) {
                        void save({ ...r, keterangan: e.target.value });
                      }
                    }}
                    style={{ padding: '6px 8px', fontSize: 12 }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
