'use client';
interface BarLineProps {
  value: number;
  color?: string;
  h?:    number;
}
export function BarLine({ value, color = '#BF4E02', h = 6 }: BarLineProps) {
  return (
    <div style={{ height: h, background: '#F2EAE3', borderRadius: 99, overflow: 'hidden', width: '100%' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: color,
        borderRadius: 99,
        transition: 'width .5s ease',
      }}/>
    </div>
  );
}
