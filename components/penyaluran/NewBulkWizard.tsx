'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Sel } from '@/components/ui/Input';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { FLabel } from '@/components/ui/FLabel';
import { fmtRp } from '@/lib/utils';
import { useKandidat, usePenyaluranLookup } from '@/hooks/usePenyaluran';

const T = { primary: '#BF4E02', gray: '#7A6055', primaryPale: '#FBF0E8', green: '#1A7A45', red: '#B02020', redPale: '#FDEAEA' };

interface Props { onClose: () => void; onSuccess: () => void; }

export function NewBulkWizard({ onClose, onSuccess }: Props) {
  const { kantor, wilayah } = usePenyaluranLookup();
  const [kantorId, setKantorId] = useState('');
  const [wilayahId, setWilayahId] = useState('');
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [previewed, setPreviewed] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredWilayah = kantorId ? wilayah.filter(w => w.kantor_id === kantorId) : wilayah;

  const kantorOptions = useMemo(
    () => kantor.map(k => ({ value: k.oid, label: k.kantor })),
    [kantor],
  );
  const wilayahOptions = useMemo(
    () => filteredWilayah.map(w => ({ value: String(w.id_wilayah_pembinaan), label: w.nama_wilayah })),
    [filteredWilayah],
  );

  const kandidat = useKandidat(
    { kantorId, wilayahId, tahun: Number(tahun), bulan: Number(bulan), limit: 5000 },
    { enabled: previewed },
  );

  const totalNominal = kandidat.rows.reduce((s, r) => s + Number(r.harga_program || 0), 0);

  const preview = () => {
    if (!wilayahId) { toast.error('Pilih wilayah terlebih dahulu.'); return; }
    setPreviewed(true);
  };

  const commit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/anakjuara/penyaluran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kantorId, wilayahId, bulan: Number(bulan), tahun: Number(tahun) }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || 'Gagal membuat batch.'); return; }
      toast.success(json.message || 'Batch penyaluran dibuat.');
      onSuccess();
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="New Penyaluran — Bulk (per Wilayah)" onClose={onClose} maxWidth={700}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          <div>
            <FLabel>Kantor</FLabel>
            <SearchSelect
              value={kantorId}
              onChange={v => { setKantorId(v); setWilayahId(''); setPreviewed(false); }}
              options={kantorOptions}
              allowEmpty
              emptyLabel="Semua kantor"
              clearable
              placeholder="Ketik atau pilih kantor…"
            />
          </div>
          <div>
            <FLabel>Wilayah</FLabel>
            <SearchSelect
              value={wilayahId}
              onChange={v => { setWilayahId(v); setPreviewed(false); }}
              options={wilayahOptions}
              clearable
              placeholder="Ketik nama wilayah…"
            />
          </div>
          <div>
            <FLabel>Bulan</FLabel>
            <Sel value={bulan} onChange={e => { setBulan(e.target.value); setPreviewed(false); }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
                <option key={b} value={String(b)}>{b}</option>
              ))}
            </Sel>
          </div>
          <div>
            <FLabel>Tahun</FLabel>
            <Sel value={tahun} onChange={e => { setTahun(e.target.value); setPreviewed(false); }}>
              {[0, 1, 2].map(d => {
                const y = new Date().getFullYear() - d;
                return <option key={y} value={String(y)}>{y}</option>;
              })}
            </Sel>
          </div>
        </div>

        <Btn variant="outline" onClick={preview} disabled={kandidat.loading}>
          {kandidat.loading ? 'Memuat kandidat…' : 'Preview Kandidat'}
        </Btn>

        {previewed && kandidat.error && (
          <div style={{
            background: T.redPale, color: T.red, borderRadius: 10, padding: 12, fontSize: 13,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span>{kandidat.error.message || 'Gagal memuat kandidat.'}</span>
            <Btn size="sm" variant="danger" onClick={() => kandidat.mutate()}>Coba Lagi</Btn>
          </div>
        )}

        {previewed && !kandidat.error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              background: T.primaryPale, borderRadius: 10, padding: 12, fontSize: 13,
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            }}>
              <span><strong>{kandidat.rows.length}</strong> anak layak salur</span>
              <span>Total: <strong style={{ color: T.green }}>{fmtRp(totalNominal)}</strong></span>
            </div>
            {!kandidat.loading && kandidat.rows.length === 0 ? (
              <div style={{
                padding: 16, textAlign: 'center', color: T.gray, fontSize: 13,
                border: '1px solid #F2EAE3', borderRadius: 8,
              }}>
                Tidak ada anak layak salur untuk kriteria ini.
              </div>
            ) : (
              <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #F2EAE3', borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: T.primaryPale, textAlign: 'left', position: 'sticky', top: 0 }}>
                      <th style={{ padding: 8, width: 32 }}>#</th>
                      <th style={{ padding: 8 }}>Anak</th>
                      <th style={{ padding: 8 }}>Jenjang</th>
                      <th style={{ padding: 8 }}>Program</th>
                      <th style={{ padding: 8, textAlign: 'right' }}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kandidat.rows.map((k, i) => (
                      <tr key={k.id_anak} style={{ borderTop: '1px solid #F2EAE3' }}>
                        <td style={{ padding: 8, color: T.gray }}>{i + 1}</td>
                        <td style={{ padding: 8 }}>
                          <strong>{k.nama_anak}</strong>
                          <div style={{ fontSize: 11, color: T.gray }}>{k.id_anak}</div>
                        </td>
                        <td style={{ padding: 8 }}>{k.jenjang_pendidikan || '-'}</td>
                        <td style={{ padding: 8 }}>{k.program_donasi || '-'}</td>
                        <td style={{ padding: 8, textAlign: 'right', fontWeight: 700, color: T.green }}>
                          {fmtRp(k.harga_program)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${T.primary}`, background: T.primaryPale }}>
                      <td colSpan={4} style={{ padding: 8, fontWeight: 800 }}>
                        Total ({kandidat.rows.length} anak)
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 800, color: T.green }}>
                        {fmtRp(totalNominal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn
            variant="primary"
            onClick={commit}
            disabled={!previewed || kandidat.rows.length === 0 || saving}
          >
            {saving ? 'Menyimpan…' : `Buat Batch (${kandidat.rows.length} anak)`}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
