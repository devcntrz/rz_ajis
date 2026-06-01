export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FAFAF8',
    }}>
      {children}
    </div>
  );
}
