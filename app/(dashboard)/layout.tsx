/**
 * app/(dashboard)/layout.tsx — Shared dashboard page layout
 * Fetches user session to pass user details to Topbar.
 */
import { requireSession } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-area">
        {/* Topbar with session info */}
        <Topbar
          namaWilayah={session.namaWilayah}
          username={session.username}
        />

        {/* Scrollable Content Container */}
        <main className="content-area">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
