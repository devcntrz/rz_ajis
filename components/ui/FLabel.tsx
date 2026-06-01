'use client';
export function FLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: '#7A6055',
      letterSpacing: 0.6, marginBottom: 4, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  );
}
