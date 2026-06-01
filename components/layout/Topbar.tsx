'use client';
import { useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';
import { useState } from 'react';

export function Topbar({ namaWilayah, username }: { namaWilayah?: string; username?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/anakjuara/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="topbar">
      <div style={{ flex: 1 }}>
        {namaWilayah && (
          <span style={{ fontSize: 13, fontWeight: 600, color: '#7A6055' }}>
            📍 {namaWilayah}
          </span>
        )}
      </div>

      <button style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#7A6055', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8,
      }}>
        <Bell size={18} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#FBF0E8', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#BF4E02',
        }}>
          {(username || 'U').slice(0, 1).toUpperCase()}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A0A00', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {username}
        </span>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, border: '1.5px solid #F0C4A0',
          background: 'transparent', color: '#BF4E02', fontWeight: 700, fontSize: 13,
          cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
        }}
      >
        <LogOut size={15} />
        {loading ? 'Keluar...' : 'Keluar'}
      </button>
    </div>
  );
}
