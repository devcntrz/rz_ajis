'use client';
interface BadgeProps {
  label: string;
  color: string;
  bg:    string;
  icon?: React.ElementType;
}
export function Badge({ label, color, bg, icon: Icon }: BadgeProps) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
      background: bg, color, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
    }}>
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
}
