/**
 * app/(dashboard)/layout.tsx — Shared dashboard page layout
 * Fetches user session to pass user details to Topbar / nav.
 */
import { requireSession } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="app-shell">
      <Sidebar idGroupUser={session.idGroupUser} />

      <div className="main-area">
        <Topbar
          namaWilayah={session.namaWilayah}
          username={session.username}
        />

        <main className="content-area">
          {children}
        </main>
      </div>

      <MobileNav idGroupUser={session.idGroupUser} />
    </div>
  );
}
