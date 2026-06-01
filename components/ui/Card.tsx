'use client';

export function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 16,
      border: '1.5px solid #F0C4A0', ...style,
    }}>
      {children}
    </div>
  );
}

interface CardHeadProps {
  icon?:  React.ElementType;
  title:  string;
  right?: React.ReactNode;
}
export function CardHead({ icon: Icon, title, right }: CardHeadProps) {
  return (
    <div style={{
      padding: '13px 18px', borderBottom: '1px solid #F2EAE3',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {Icon && <Icon size={17} color="#BF4E02" strokeWidth={2} />}
      <span style={{ fontWeight: 800, fontSize: 15, color: '#1A0A00', flex: 1 }}>{title}</span>
      {right}
    </div>
  );
}
