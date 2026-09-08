'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { SEMESTER_TEMPLATE_FIELDS } from '@/types/semester';
import type { Semester, SemesterTemplateField } from '@/types/semester';

interface SemesterTemplateUploadProps {
  row: Semester;
  onClose: () => void;
  onSuccess: () => void;
}

const FIELD_LABELS: Record<SemesterTemplateField, string> = {
  cover: 'Cover',
  cover_siswa: 'Cover Siswa',
  kata_pengantar: 'Kata Pengantar',
  kata_pengantar_siswa: 'Kata Pengantar Siswa',
  bawah: 'Bawah',
  bawah_siswa: 'Bawah Siswa',
  profil: 'Profil',
  keuangan: 'Keuangan',
  surat: 'Surat',
  kotak_profil_ceria: 'Kotak Profil Ceria',
  kotak_profil_siswa: 'Kotak Profil Siswa',
  kotak_pembinaan_ceria: 'Kotak Pembinaan Ceria',
  kotak_pembinaan_siswa: 'Kotak Pembinaan Siswa',
};

export function SemesterTemplateUpload({ row, onClose, onSuccess }: SemesterTemplateUploadProps) {
  const [urls, setUrls] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    SEMESTER_TEMPLATE_FIELDS.forEach(f => { initial[f] = row[f]; });
    return initial;
  });
  const [uploadingField, setUploadingField] = useState<SemesterTemplateField | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handlePick = (field: SemesterTemplateField) => {
    fileInputs.current[field]?.click();
  };

  const handleFile = async (field: SemesterTemplateField, file: File) => {
    setUploadingField(field);
    try {
      const form = new FormData();
      form.append(field, file);
      const res = await fetch(`/api/anakjuara/semester/${row.id}/template`, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || `Gagal upload ${FIELD_LABELS[field]}.`);
        return;
      }
      setUrls(prev => ({ ...prev, [field]: json.data[field] ?? prev[field] }));
      toast.success(`${FIELD_LABELS[field]} berhasil diperbarui.`);
      onSuccess();
    } catch {
      toast.error(`Gagal upload ${FIELD_LABELS[field]}.`);
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <Modal title={`Template PDF — ${row.semester}`} onClose={onClose} maxWidth={880}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14,
      }}>
        {SEMESTER_TEMPLATE_FIELDS.map(field => (
          <div key={field} style={{
            border: '1.5px solid #F0C4A0', borderRadius: 12, padding: 10,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8F3A01' }}>{FIELD_LABELS[field]}</div>
            <div style={{
              height: 100, borderRadius: 8, background: '#FBF0E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {urls[field] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls[field] ?? ''} alt={FIELD_LABELS[field]} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: 11, color: '#7A6055' }}>Belum ada gambar</span>
              )}
            </div>
            <input
              ref={el => { fileInputs.current[field] = el; }}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFile(field, file);
                e.target.value = '';
              }}
            />
            <Btn
              variant="outline"
              size="sm"
              onClick={() => handlePick(field)}
              disabled={uploadingField === field}
            >
              {uploadingField === field ? (
                <><Loader2 size={13} className="ajis-spin" /> Mengunggah...</>
              ) : (
                <><Upload size={13} /> Ganti</>
              )}
            </Btn>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <Btn variant="primary" onClick={onClose}>Selesai</Btn>
      </div>
    </Modal>
  );
}
