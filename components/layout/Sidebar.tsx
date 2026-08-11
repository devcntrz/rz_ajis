'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, ClipboardList, Award, ChevronRight, GraduationCap, RefreshCw,
} from 'lucide-react';

const T = {
  primary: '#BF4E02', primaryDk: '#8F3A01', primaryLt: '#D96A1A',
  white: '#FFFFFF',
};

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  groups?: number[];
}

const navItems: NavItem[] = [
  { href: '/',                 icon: Home,          label: 'Beranda' },
  { href: '/anak',             icon: Users,         label: 'Anak Asuh' },
  { href: '/anak-juara',       icon: GraduationCap, label: 'Anak Juara',       groups: [1, 2] },
  { href: '/ajuan-pergantian', icon: RefreshCw,     label: 'Ajuan Pergantian', groups: [1, 2] },
  { href: '/pembinaan',        icon: ClipboardList, label: 'Pembinaan' },
  { href: '/penilaian',        icon: Award,         label: 'Penilaian' },
];

interface SidebarProps {
  idGroupUser: number;
}

export function Sidebar({ idGroupUser }: SidebarProps) {
  const pathname = usePathname();
  const visible = navItems.filter(
    item => !item.groups || item.groups.includes(idGroupUser),
  );

  return (
    <nav className="sidebar">
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid rgba(255,255,255,.18)',
      }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: T.white, lineHeight: 1.2 }}>
          Anak Juara
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 2, fontWeight: 500 }}>
          Information System
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 10px' }}>
        {visible.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10,
                background: active ? 'rgba(255,255,255,.22)' : 'transparent',
                color: active ? T.white : 'rgba(255,255,255,.78)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'background .15s',
              }}>
                <Icon size={17} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <ChevronRight size={14} />}
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{
        padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.15)',
        fontSize: 11, color: 'rgba(255,255,255,.5)',
      }}>
        AJIS Web v1.0
      </div>
    </nav>
  );
}
