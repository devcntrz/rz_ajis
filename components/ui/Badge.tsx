'use client';
interface BadgeProps {
  label: string;
  color: string;
  bg:    string;
}
export function Badge({ label, color, bg }: BadgeProps) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
      background: bg, color, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
