'use client';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { FLabel } from '@/components/ui/FLabel';
import { Input, Textarea } from '@/components/ui/Input';
import { KeuanganGrid } from '@/components/keuangan/KeuanganGrid';
import type { KeuanganPivot } from '@/lib/keuangan';
import type { AnakJuaraRow } from '@/types/anak-juara';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface OpnameFormProps {
  row: AnakJuaraRow;
  onClose: () => void;
  onSuccess: () => void;
}

interface OpnameYear {
  tahun: string;
  id_pemasangan_baru: string;
  keuangan: KeuanganPivot;
  opname: {
    saldo_awal_ganjil:  number;
    saldo_akhir_ganjil: number;
    saldo_awal_genap:   number;
    saldo_akhir_genap:  number;
    keterangan:         string;
  } | null;
}

interface OpnamePayload {
  pairing: {
    id_pemasangan_baru: string;
    tahun:              string;
    id_anak:            string;
    nama_anak:          string;
    id_donatur:         string;
    nama_donatur:       string;
    program_donasi:     string;
  };
  years: OpnameYear[];
}

const numInputStyle: React.CSSProperties = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

function fmtRp(n: number) {
  return Number(n || 0).toLocaleString('id-ID');
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.45, minWidth: 0 }}>
      <div style={{ width: 90, flexShrink: 0, color: '#7A6055', fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#1A0A00', fontWeight: 600, minWidth: 0, wordBreak: 'break-word' }}>
        {value || '—'}
      </div>
    </div>
  );
}

export function OpnameForm({ row, onClose, onSuccess }: OpnameFormProps) {
  const [saldoAwalGanjil, setSaldoAwalGanjil] = useState('0');
  const [saldoAkhirGanjil, setSaldoAkhirGanjil] = useState('0');
  const [saldoAwalGenap, setSaldoAwalGenap] = useState('0');
  const [saldoAkhirGenap, setSaldoAkhirGenap] = useState('0');
  const [keterangan, setKeterangan] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Prefill happens once, on the first successful load — doing it in an effect would
  // set state during render and cascade an extra pass.
  const prefilled = useRef(false);

  const { data: res, isLoading } = useSWR<{ data: OpnamePayload }>(
    `/api/anakjuara/opname?id_pemasangan_baru=${encodeURIComponent(row.id_pemasangan_baru)}`,
    fetcher,
    {
      revalidateOnFocus: false,
      onSuccess: payload => {
        if (prefilled.current) return;
        const years = payload?.data?.years ?? [];
        const cur = years.find(y => y.id_pemasangan_baru === row.id_pemasangan_baru) ?? years[0];
        if (!cur) return;
        const o = cur.opname;
        setSaldoAwalGanjil(String(o?.saldo_awal_ganjil ?? 0));
        setSaldoAkhirGanjil(String(o?.saldo_akhir_ganjil ?? 0));
        setSaldoAwalGenap(String(o?.saldo_awal_genap ?? 0));
        setSaldoAkhirGenap(String(o?.saldo_akhir_genap ?? 0));
        setKeterangan(o?.keterangan ?? '');
        prefilled.current = true;
      },
    },
  );

  const detail = res?.data;
  const years = detail?.years ?? [];
  // The row being edited is the pairing the operator opened, not merely the newest.
  const current = years.find(y => y.id_pemasangan_baru === row.id_pemasangan_baru) ?? years[0];

  /*
   * "By rumus" — recomputed live from the saldo awal being typed rather than read
   * from the response. That is the whole point of the legacy warning that saldo akhir
   * does not follow saldo awal automatically: here the operator sees the consequence
   * immediately instead of having to re-run opname to find out.
   */
  const rumusGanjil = (Number(saldoAwalGanjil) || 0)
    + (current?.keuangan.ganjil.jml_donasi ?? 0)
    - (current?.keuangan.ganjil.jml_tersalurkan ?? 0);
  const rumusGenap = (Number(saldoAwalGenap) || 0)
    + (current?.keuangan.genap.jml_donasi ?? 0)
    - (current?.keuangan.genap.jml_tersalurkan ?? 0);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const resp = await fetch('/api/anakjuara/opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pemasangan_baru: row.id_pemasangan_baru,
          saldo_awal_ganjil:  Number(saldoAwalGanjil) || 0,
          saldo_akhir_ganjil: Number(saldoAkhirGanjil) || 0,
          saldo_awal_genap:   Number(saldoAwalGenap) || 0,
          saldo_akhir_genap:  Number(saldoAkhirGenap) || 0,
          keterangan:         keterangan.trim(),
        }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        const msg = json.error || 'Gagal menyimpan opname.';
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(`Opname ${row.nama_anak} tahun ${current?.tahun ?? ''} berhasil diperbarui.`);
      onSuccess();
    } catch {
      const msg = 'Gagal menyimpan opname.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /** One semester block: saldo awal, the computed value, and the stored value. */
  const semester = (
    judul: string,
    awal: string, setAwal: (v: string) => void,
    rumus: number,
    akhir: string, setAkhir: (v: string) => void,
  ) => {
    const beda = (Number(akhir) || 0) !== rumus;
    return (
      <div style={{
        border: '1.5px solid #F0C4A0', borderRadius: 12, padding: 12,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#8F3A01' }}>{judul}</div>

        <div>
          <FLabel>Saldo awal {judul}</FLabel>
          <Input type="number" value={awal} onChange={e => setAwal(e.target.value)} style={numInputStyle} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, background: '#FBF0E8', borderRadius: 10, padding: '8px 10px',
        }}>
          <span style={{ fontSize: 12, color: '#7A6055', fontWeight: 600 }}>
            Saldo akhir {judul} <em style={{ fontWeight: 400 }}>by rumus</em>
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {fmtRp(rumus)}
          </span>
        </div>

        <div>
          <FLabel>Saldo akhir {judul} (tersimpan)</FLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Input type="number" value={akhir} onChange={e => setAkhir(e.target.value)} style={numInputStyle} />
            </div>
            <Btn variant="outline" size="sm" onClick={() => setAkhir(String(rumus))}>
              Samakan
            </Btn>
          </div>
          {beda && (
            <div style={{ fontSize: 11, color: '#B02020', marginTop: 4, fontWeight: 600 }}>
              Berbeda dengan nilai by rumus — samakan bila memang harus sama.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    // Closing mid-save would leave the operator unsure whether the balance landed.
    <Modal title="Update Opname" onClose={saving ? () => {} : onClose} maxWidth={1040}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        pointerEvents: saving ? 'none' : undefined,
        opacity: saving ? 0.6 : 1,
        transition: 'opacity .15s',
      }}>
        <KeuanganGrid
          hint="Data Keuangan tahun ini dan tahun sebelumnya utk cek akurasi"
          emptyText={isLoading ? 'Memuat data keuangan...' : 'Tidak ada data keuangan.'}
          rows={years.map(y => ({
            key: y.id_pemasangan_baru,
            tahun: y.tahun,
            id_anak: detail?.pairing.id_anak ?? row.id_anak,
            nama_anak: detail?.pairing.nama_anak ?? row.nama_anak,
            pivot: y.keuangan,
          }))}
        />

        <div style={{ fontSize: 12, color: '#8F3A01', fontStyle: 'italic' }}>
          Data saldo akhir tidak otomatis berubah ketika saldo awal diupdate, bisa jadi
          perlu diupdate opname sekali lagi.
        </div>

        <div style={{
          background: '#FBF0E8', borderRadius: 12, padding: 12, border: '1px solid #F0C4A0',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '6px 18px',
        }}>
          <InfoRow label="Anak" value={detail?.pairing.nama_anak ?? row.nama_anak} />
          <InfoRow label="Donatur" value={detail?.pairing.nama_donatur ?? row.nama_donatur} />
          <InfoRow label="Program" value={detail?.pairing.program_donasi ?? row.program_donasi} />
          <InfoRow label="Tahun" value={current?.tahun ?? row.tahun} />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12,
        }}>
          {semester('Jan Jun', saldoAwalGanjil, setSaldoAwalGanjil, rumusGanjil, saldoAkhirGanjil, setSaldoAkhirGanjil)}
          {semester('Jul Des', saldoAwalGenap, setSaldoAwalGenap, rumusGenap, saldoAkhirGenap, setSaldoAkhirGenap)}
        </div>

        <div>
          <FLabel>Keterangan Update</FLabel>
          <Textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={3} />
        </div>

        {error && (
          <div style={{
            background: '#FDEAEA', color: '#B02020', borderRadius: 10,
            padding: '10px 12px', fontSize: 13, fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center',
          // Kept interactive so the disabled state stops the user, not a dead zone.
          pointerEvents: 'auto',
        }}>
          {saving && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginRight: 'auto', fontSize: 12, fontWeight: 600, color: '#8F3A01',
            }}>
              <Loader2 size={15} className="ajis-spin" />
              Menyimpan opname — jangan tutup jendela ini...
            </span>
          )}
          <Btn variant="ghost" onClick={onClose} disabled={saving}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={saving || isLoading}>
            {saving ? (
              <>
                <Loader2 size={14} className="ajis-spin" />
                Menyimpan...
              </>
            ) : 'Save'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
