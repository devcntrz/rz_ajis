'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { GroupSwitcher } from './GroupSwitcher';
import { activeHref, groupForPath, visibleItems, type NavItem } from './navConfig';

const T = {
  primary: '#BF4E02', primaryDk: '#8F3A01', primaryLt: '#D96A1A',
  white: '#FFFFFF',
};

interface SidebarProps {
  idGroupUser: number;
}

export function Sidebar({ idGroupUser }: SidebarProps) {
  const pathname = usePathname();
  // The path decides the group, not stored state: a deep link must never open the
  // sidebar on the group that does not contain the page being viewed.
  const group = groupForPath(pathname);
  const items = visibleItems(group, idGroupUser);
  const active = activeHref(items, pathname);

  // Group consecutive items by section, preserving the config's order.
  const sections: { name?: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const last = sections[sections.length - 1];
    if (last && last.name === item.section) last.items.push(item);
    else sections.push({ name: item.section, items: [item] });
  }

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
        <GroupSwitcher group={group} />
      </div>

      <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {sections.map((section, si) => (
          <div key={section.name ?? si} style={{ marginBottom: section.name ? 10 : 0 }}>
            {section.name && (
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.5)',
                padding: '10px 12px 5px',
              }}>
                {section.name}
              </div>
            )}

            {section.items.map(({ href, icon: Icon, label, ready }) => {
              const isActive = href === active;
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 10,
                    background: isActive ? 'rgba(255,255,255,.22)' : 'transparent',
                    color: isActive ? T.white : 'rgba(255,255,255,.78)',
                    fontWeight: isActive ? 700 : 500, fontSize: 14,
                    transition: 'background .15s',
                  }}>
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, opacity: ready === false ? 0.72 : 1 }}>{label}</span>
                    {ready === false && (
                      <span
                        title="Halaman belum tersedia"
                        style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '.03em',
                          padding: '2px 5px', borderRadius: 5,
                          background: 'rgba(255,255,255,.16)',
                          color: 'rgba(255,255,255,.72)',
                          flexShrink: 0,
                        }}
                      >
                        SOON
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} style={{ flexShrink: 0 }} />}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
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
