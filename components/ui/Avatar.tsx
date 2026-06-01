'use client';
import { inits } from '@/lib/utils';

const T = {
  primary: '#BF4E02', primaryDk: '#8F3A01', blue: '#1A5FA8', white: '#FFFFFF',
};

interface AvatarProps {
  nama:   string;
  gender?: 'l' | 'p' | string;
  size?:  number;
}

export function Avatar({ nama, gender, size = 36 }: AvatarProps) {
  const bg    = gender === 'p' ? '#F5D5BE' : '#C8D8F0';
  const color = gender === 'p' ? T.primaryDk : T.blue;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color, flexShrink: 0,
    }}>
      {inits(nama || '?')}
    </div>
  );
}
