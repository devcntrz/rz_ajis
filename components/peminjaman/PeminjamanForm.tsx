'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Input } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { useKaryawanPeminjam } from '@/hooks/usePeminjaman';

const T = { primaryPale: '#FBF0E8', primary: '#BF4E02', gray: '#7A6055', grayLt: '#F2EAE3' };

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface AnakOption { id_anak: string; nama_lengkap: string; nama_kantor: string | null }

interface Props {
  presetAnak?: AnakOption;
  onClose: () => void;
  onSuccess: () => void;
}

export function PeminjamanForm({ presetAnak, onClose, onSuccess }: Props) {
  const [q, setQ] = useState('');
  const [anak, setAnak] = useState<AnakOption | null>(presetAnak ?? null);
  const [idKaryawan, setIdKaryawan] = useState('');
  const [tglAwal, setTglAwal] = useState(() => new Date().toISOString().slice(0, 10));
  const [jmlHari, setJmlHari] = useState(30);
  const [saving, setSaving] = useState(false);

  const karyawan = useKaryawanPeminjam();
  const karyawanOptions = useMemo(
    () => karyawan.data.map(k => ({ value: k.id_karyawan, label: `${k.nama} (${k.id_karyawan})` })),
    [karyawan.data],
  );
  const anakSearch = useSWR<{ data: AnakOption[] }>(
    !presetAnak && q.trim().length >= 2 ? `/api/anakjuara/anak?q=${encodeURIComponent(q)}&limit=10` : null,
    fetcher,
  );

  const save = async () => {
    if (!anak) { toast.error('Pilih anak terlebih dahulu.'); return; }
    const namaPeminjam = karyawan.data.find(k => k.id_karyawan === idKaryawan)?.nama ?? '';
    if (!idKaryawan || !namaPeminjam) { toast.error('Pilih peminjam terlebih dahulu.'); return; }
    if (idKaryawan.length > 16) { toast.error('ID peminjam terlalu panjang (maks 16 karakter).'); return; }
    if (!jmlHari || jmlHari <= 0) { toast.error('Jumlah hari peminjaman tidak valid.'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_anak: anak.id_anak,
          tipe_peminjam: 'karyawan',
          id_peminjam: idKaryawan,
          nama_peminjam: namaPeminjam,
          tgl_awal_peminjaman: tglAwal,
          jml_hari_peminjaman: jmlHari,
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal menyimpan peminjaman.'); return; }
      toast.success(json.message || 'Peminjaman tersimpan.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Peminjaman Anak — Baru" onClose={onClose} maxWidth={640}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!presetAnak && (
          <div>
            <FLabel>Cari Anak</FLabel>
            <Input value={q} onChange={e => { setQ(e.target.value); setAnak(null); }} placeholder="Nama atau ID anak…" />
            {q.trim().length >= 2 && !anak && (
              <div style={{ maxHeight: 180, overflowY: 'auto', border: `1.5px solid ${T.grayLt}`, borderRadius: 8, marginTop: 6 }}>
                {anakSearch.isLoading && <div style={{ padding: 10, fontSize: 12, color: T.gray }}>Mencari…</div>}
                {!anakSearch.isLoading && (anakSearch.data?.data ?? []).map(a => (
                  <div
                    key={a.id_anak}
                    onClick={() => setAnak(a)}
                    style={{ padding: '7px 10px', fontSize: 13, cursor: 'pointer', borderBottom: `1px solid ${T.grayLt}` }}
                  >
                    <strong>{a.nama_lengkap}</strong> <span style={{ color: T.gray }}>({a.id_anak})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {anak && (
          <div style={{ background: T.primaryPale, borderRadius: 10, padding: 10, fontSize: 13 }}>
            <strong>{anak.nama_lengkap}</strong> · {anak.id_anak} · {anak.nama_kantor || '-'}
          </div>
        )}

        <div>
          <FLabel>Tipe Peminjam</FLabel>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A0A00' }}>Karyawan ZISCO</div>
        </div>

        <div>
          <FLabel>Nama Peminjam (Karyawan ZISCO / Atasan)</FLabel>
          <SearchSelect
            value={idKaryawan}
            onChange={setIdKaryawan}
            options={karyawanOptions}
            disabled={karyawan.loading}
            clearable
            placeholder="Ketik nama karyawan…"
            limit={5}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FLabel>Tgl Awal Peminjaman</FLabel>
            <Input type="date" value={tglAwal} onChange={e => setTglAwal(e.target.value)} />
          </div>
          <div>
            <FLabel>Jumlah Hari Peminjaman</FLabel>
            <Input type="number" value={jmlHari} onChange={e => setJmlHari(Number(e.target.value) || 0)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan Peminjaman'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
