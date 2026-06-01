'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHead } from '@/components/ui/Card';
import { FLabel } from '@/components/ui/FLabel';
import { Input } from '@/components/ui/Input';
import { Btn } from '@/components/ui/Btn';
import { KeyRound, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/anakjuara/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Terjadi kesalahan login.');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 380, padding: 16 }}>
      <Card style={{ padding: 22 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#BF4E02', lineHeight: 1.2 }}>
            Anak Juara
          </div>
          <div style={{ fontSize: 13, color: '#7A6055', marginTop: 4, fontWeight: 500 }}>
            Masuk dengan kredensial AJIS Anda
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FDEAEA', color: '#B02020', border: '1px solid rgba(176, 32, 32, 0.2)',
            borderRadius: 8, padding: '10px 12px', fontSize: 12, fontWeight: 600, marginBottom: 16,
            textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <FLabel>Nama Pengguna (Username)</FLabel>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#7A6055" style={{ position: 'absolute', left: 10, top: 11 }} />
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                required
                disabled={loading}
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>

          <div>
            <FLabel>Kata Sandi (Password)</FLabel>
            <div style={{ position: 'relative' }}>
              <KeyRound size={15} color="#7A6055" style={{ position: 'absolute', left: 10, top: 11 }} />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                required
                disabled={loading}
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>

          <Btn
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: 11, fontSize: 14, marginTop: 6 }}
          >
            {loading ? 'Masuk...' : 'Masuk ke Akun'}
          </Btn>
        </form>
      </Card>
    </div>
  );
}
