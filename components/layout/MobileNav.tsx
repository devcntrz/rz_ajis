'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ClipboardList, Award, GraduationCap, RefreshCw } from 'lucide-react';

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  groups?: number[];
}

const navItems: NavItem[] = [
  { href: '/',                 icon: Home,          label: 'Beranda' },
  { href: '/anak',             icon: Users,         label: 'Anak' },
  { href: '/anak-juara',       icon: GraduationCap, label: 'AJ',      groups: [1, 2] },
  { href: '/ajuan-pergantian', icon: RefreshCw,     label: 'Ajuan',   groups: [1, 2] },
  { href: '/pembinaan',        icon: ClipboardList, label: 'Pembinaan' },
  { href: '/penilaian',        icon: Award,         label: 'Penilaian' },
];

interface MobileNavProps {
  idGroupUser: number;
}

export function MobileNav({ idGroupUser }: MobileNavProps) {
  const pathname = usePathname();
  const visible = navItems.filter(
    item => !item.groups || item.groups.includes(idGroupUser),
  );

  return (
    <nav className="mobile-nav">
      {visible.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            flex: 1, textDecoration: 'none', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, background: active ? 'rgba(255,255,255,.18)' : 'transparent',
          }}>
            <Icon size={20} color={active ? '#FFFFFF' : 'rgba(255,255,255,.65)'} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? '#FFFFFF' : 'rgba(255,255,255,.65)',
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
