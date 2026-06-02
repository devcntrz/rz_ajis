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
      {/* Location — desktop only */}
      <div className="topbar-location" style={{ flex: 1, minWidth: 0 }}>
        {namaWilayah && (
          <span style={{ fontSize: 13, fontWeight: 600, color: '#7A6055', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            📍 {namaWilayah}
          </span>
        )}
      </div>

      {/* Spacer on mobile so right items push to the edge */}
      <div className="topbar-spacer" style={{ flex: 1 }} />

      <button style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#7A6055', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8,
      }}>
        <Bell size={18} />
      </button>

      {/* Avatar + username */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: '#FBF0E8', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#BF4E02',
        }}>
          {(username || 'U').slice(0, 1).toUpperCase()}
        </div>
        {/* Username text — desktop only */}
        <span className="topbar-username" style={{ fontSize: 13, fontWeight: 600, color: '#1A0A00', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {username}
        </span>
      </div>

      {/* Logout — icon only on mobile, icon+text on desktop */}
      <button
        onClick={handleLogout}
        disabled={loading}
        title="Keluar"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 10px', borderRadius: 8, border: '1.5px solid #F0C4A0',
          background: 'transparent', color: '#BF4E02', fontWeight: 700, fontSize: 13,
          cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}
      >
        <LogOut size={15} />
        <span className="topbar-logout-text">{loading ? 'Keluar...' : 'Keluar'}</span>
      </button>
    </div>
  );
}
