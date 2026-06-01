'use client';

interface ToggleProps {
  value:    boolean;
  onChange: (v: boolean) => void;
  label?:   string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <div style={{
        width: 36, height: 20, borderRadius: 10,
        background: value ? '#1A7A45' : '#D9CFC8',
        transition: 'background .2s', position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 16 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#FFFFFF', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </div>
      {label && (
        <span style={{ fontSize: 13, color: value ? '#1A7A45' : '#7A6055', fontWeight: value ? 700 : 400 }}>
          {label}
        </span>
      )}
    </button>
  );
}
