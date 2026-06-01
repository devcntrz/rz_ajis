'use client';
import { Toggle } from '@/components/ui/Toggle';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { ORTU_HADIR_OPTIONS } from '@/lib/pembinaanConstants';
import type { PembinaanAnakRow, Mandiri } from '@/types/pembinaan';

const ortuOptions = ORTU_HADIR_OPTIONS.map(o => ({ value: o.value, label: o.label }));

interface AttendanceMatrixProps {
  anakList:       PembinaanAnakRow[];
  kehadiran:      Record<string, 'y' | 'n'>;
  keterangan:     Record<string, string>;
  mandiri:        Record<string, Mandiri>;
  ortuHadir?:     Record<string, string>;
  showParenting?: boolean;
  onChange: (
    kehadiran:  Record<string, 'y' | 'n'>,
    keterangan: Record<string, string>,
    mandiri:    Record<string, Mandiri>,
    ortuHadir?: Record<string, string>,
  ) => void;
}

export function AttendanceMatrix({
  anakList, kehadiran, keterangan, mandiri, ortuHadir = {}, showParenting = false, onChange,
}: AttendanceMatrixProps) {

  function handleHadirToggle(anakId: string, isHadir: boolean) {
    const nextKehadiran = { ...kehadiran, [anakId]: isHadir ? ('y' as const) : ('n' as const) };
    const nextKeterangan = { ...keterangan };
    const nextOrtu = { ...ortuHadir };
    if (isHadir) {
      delete nextKeterangan[anakId];
    } else {
      nextKeterangan[anakId] = nextKeterangan[anakId] || 'Alfa';
      delete nextOrtu[anakId];
    }
    onChange(nextKehadiran, nextKeterangan, mandiri, nextOrtu);
  }

  function handleKetChange(anakId: string, value: string) {
    onChange(kehadiran, { ...keterangan, [anakId]: value }, mandiri, ortuHadir);
  }

  function handleOrtuChange(anakId: string, value: string) {
    onChange(kehadiran, keterangan, mandiri, { ...ortuHadir, [anakId]: value });
  }

  function handleMandiriToggle(anakId: string, key: keyof Mandiri, value: boolean) {
    const childMandiri = mandiri[anakId] || { shalat_wajib: false, tilawah: false, sedekah: false, bantu_ortu: false };
    onChange(kehadiran, keterangan, {
      ...mandiri,
      [anakId]: { ...childMandiri, [key]: value },
    }, ortuHadir);
  }

  const colSpan = showParenting ? 5 : 4;

  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: showParenting ? 920 : 800, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
              <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', textAlign: 'left' }}>Anak Asuh</th>
              <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', width: 90, textAlign: 'center' }}>Kehadiran</th>
              <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', width: 160, textAlign: 'left' }}>Keterangan / Izin</th>
              {showParenting && (
                <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', width: 120, textAlign: 'left' }}>Ortu Hadir</th>
              )}
              <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', textAlign: 'center' }}>Pembiasaan Mandiri (Jika Hadir)</th>
            </tr>
          </thead>
          <tbody>
            {anakList.length === 0 && (
              <tr>
                <td colSpan={colSpan} style={{ textAlign: 'center', padding: 30, color: '#7A6055', fontSize: 13 }}>
                  Tidak ada anak asuh di wilayah ini.
                </td>
              </tr>
            )}
            {anakList.map((anak, i) => {
              const isHadir = (kehadiran[anak.id_anak] ?? 'n') === 'y';
              const ket = keterangan[anak.id_anak] || '';
              const m = mandiri[anak.id_anak] || { shalat_wajib: false, tilawah: false, sedekah: false, bantu_ortu: false };
              const ortu = ortuHadir[anak.id_anak] || '';

              return (
                <tr key={anak.id_anak} style={{ borderBottom: '1px solid #F2EAE3', background: i % 2 === 0 ? '#FFFFFF' : '#FDFAF8' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar nama={anak.nama_lengkap} gender={anak.jns_kel} size={28} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A0A00' }}>{anak.nama_lengkap}</div>
                        <div style={{ fontSize: 11, color: '#7A6055' }}>{anak.id_anak} • {anak.jenjang_pendidikan}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'inline-block' }}>
                      <Toggle
                        value={isHadir}
                        onChange={v => handleHadirToggle(anak.id_anak, v)}
                        label={isHadir ? 'Hadir' : 'Alfa'}
                      />
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                    {!isHadir ? (
                      <Input
                        value={ket}
                        onChange={e => handleKetChange(anak.id_anak, e.target.value)}
                        placeholder="Contoh: Sakit, Izin, Alfa"
                        style={{ padding: '5px 8px', fontSize: 12 }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: '#7A6055' }}>—</span>
                    )}
                  </td>

                  {showParenting && (
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      {isHadir ? (
                        <SearchSelect
                          options={ortuOptions}
                          value={ortu}
                          onChange={v => handleOrtuChange(anak.id_anak, v)}
                          placeholder="Pilih ortu..."
                          style={{ minWidth: 110 }}
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: '#7A6055' }}>—</span>
                      )}
                    </td>
                  )}

                  <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                    {isHadir ? (
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Toggle value={!!m.shalat_wajib} onChange={v => handleMandiriToggle(anak.id_anak, 'shalat_wajib', v)} label="Shalat" />
                        <Toggle value={!!m.tilawah} onChange={v => handleMandiriToggle(anak.id_anak, 'tilawah', v)} label="Tilawah" />
                        <Toggle value={!!m.sedekah} onChange={v => handleMandiriToggle(anak.id_anak, 'sedekah', v)} label="Sedekah" />
                        <Toggle value={!!m.bantu_ortu} onChange={v => handleMandiriToggle(anak.id_anak, 'bantu_ortu', v)} label="Bantu Ortu" />
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', fontSize: 11, color: '#7A6055' }}>—</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
