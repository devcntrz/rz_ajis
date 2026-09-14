'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Camera } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { anakFotoUrl } from '@/lib/anakFotoUrl';

interface AnakFotoUploadProps {
  idAnak: string;
  nama:   string;
  gender: string;
  foto:   string | null | undefined;
  size?:  number;
  onUploaded: (url: string) => void;
}

export function AnakFotoUpload({ idAnak, nama, gender, foto, size = 60, onUploaded }: AnakFotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const url = anakFotoUrl(foto);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    try {
      const form = new FormData();
      form.append('foto', file);
      const res = await fetch(`/api/anakjuara/anak/${encodeURIComponent(idAnak)}/foto`, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Gagal mengunggah foto.');
        return;
      }
      toast.success('Foto berhasil diperbarui.');
      onUploaded(json.data.foto as string);
    } catch {
      toast.error('Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={nama}
          width={size}
          height={size}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <Avatar nama={nama} gender={gender} size={size} />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Ganti foto"
        style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 24, height: 24, borderRadius: '50%',
          background: '#BF4E02', border: '2px solid #FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? <Loader2 size={12} color="#FFFFFF" className="ajis-spin" /> : <Camera size={12} color="#FFFFFF" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}
