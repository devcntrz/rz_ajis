'use client';

interface StatCardProps {
  icon?:  React.ElementType;
  label:  string;
  value:  string | number;
  color?: string;
  sub?:   string;
}

export function StatCard({ icon: Icon, label, value, color = '#BF4E02', sub }: StatCardProps) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 14,
      padding: '16px 18px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -14, right: -14, width: 68, height: 68,
        borderRadius: '50%', background: '#FBF0E8', opacity: 0.7,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        {Icon && <Icon size={15} color={color} strokeWidth={2.5} />}
        <span style={{ fontSize: 12, color: '#7A6055', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#7A6055', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
