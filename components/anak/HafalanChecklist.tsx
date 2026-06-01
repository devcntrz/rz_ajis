'use client';
import { useState, useTransition } from 'react';
import { useHafalanChecklist } from '@/hooks/useHafalan';
import { Toggle } from '@/components/ui/Toggle';
import { Btn } from '@/components/ui/Btn';
import { JENIS_LABEL } from '@/types/hafalan';

interface HafalanChecklistProps {
  idAnak:   string;
  semester: string;
}

export function HafalanChecklist({ idAnak, semester }: HafalanChecklistProps) {
  const { items, loading, error, mutate } = useHafalanChecklist(idAnak, semester);
  const [saving, setSaving] = useState(false);
  const [dirtyItems, setDirtyItems] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 40, borderRadius: 10 }} />
        ))}
      </div>
    );
  }
  if (error) return <div style={{ color: '#B02020' }}>Gagal memuat checklist hafalan.</div>;

  // Group by jenis (2=Quran, 3=Shalat, 4=Doa)
  const grouped = {
    2: items.filter(i => i.jenis === 2),
    3: items.filter(i => i.jenis === 3),
    4: items.filter(i => i.jenis === 4),
  };

  function handleToggle(id: number) {
    setDirtyItems(prev => ({
      ...prev,
      [id]: !items.find(item => item.id === id)?.selesai,
    }));
  }

  async function handleSave() {
    setSaving(true);
    const payloads = Object.entries(dirtyItems).map(([idStr, value]) => {
      const original = items.find(item => item.id === Number(idStr));
      return {
        konten:  original!.konten,
        jenis:   original!.jenis,
        selesai: value,
      };
    });

    try {
      const res = await fetch(`/api/anakjuara/anak/${idAnak}/hafalan`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ semester, items: payloads }),
      });

      if (!res.ok) throw new Error();

      // Reset dirty changes and revalidate
      setDirtyItems({});
      mutate();
      alert('Hafalan berhasil disimpan!');
    } catch {
      alert('Gagal menyimpan hafalan.');
    } finally {
      setSaving(false);
    }
  }

  const isDirty = Object.keys(dirtyItems).length > 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn
          onClick={handleSave}
          disabled={!isDirty || saving}
          variant="primary"
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Btn>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[2, 3, 4].map(jenisKey => {
          const catItems = grouped[jenisKey as keyof typeof grouped] || [];
          if (catItems.length === 0) return null;

          return (
            <div key={jenisKey}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#BF4E02', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {JENIS_LABEL[jenisKey as keyof typeof JENIS_LABEL]}
              </h4>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 10, background: '#FFFFFF', border: '1.5px solid #F2EAE3',
                borderRadius: 14, padding: 14,
              }}>
                {catItems.map(item => {
                  const currentValue = dirtyItems[item.id] !== undefined ? dirtyItems[item.id] : !!item.selesai;
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', height: 28 }}>
                      <Toggle
                        value={currentValue}
                        onChange={() => handleToggle(item.id)}
                        label={item.konten}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
