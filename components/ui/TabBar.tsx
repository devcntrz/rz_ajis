'use client';

interface Tab { id: string; label: string; }
interface TabBarProps {
  tabs:     Tab[];
  active:   string;
  onChange: (id: string) => void;
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div style={{
      display: 'flex', borderBottom: '2px solid #F2EAE3', marginBottom: 18,
      overflowX: 'auto', flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', fontFamily: 'inherit',
            color: active === t.id ? '#BF4E02' : '#7A6055',
            borderBottom: `2.5px solid ${active === t.id ? '#BF4E02' : 'transparent'}`,
            marginBottom: -2,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
