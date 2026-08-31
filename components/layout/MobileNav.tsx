'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal, X } from 'lucide-react';
import { activeHref, groupForPath, visibleItems, NAV, GROUPS, type NavGroup } from './navConfig';

const T = { primary: '#BF4E02', white: '#FFFFFF', charcoal: '#1A0A00' };

/** Bottom-bar slots. The last one is "Lainnya" whenever the group has more. */
const BAR_SLOTS = 5;

interface MobileNavProps {
  idGroupUser: number;
}

export function MobileNav({ idGroupUser }: MobileNavProps) {
  const pathname = usePathname();
  const group = groupForPath(pathname);
  const items = visibleItems(group, idGroupUser);
  const active = activeHref(items, pathname);

  // The sheet remembers WHICH page it was opened from rather than a plain boolean.
  // Navigating away therefore closes it for free — a tap must not leave the sheet
  // covering the page the user just asked for — with no effect and no extra render.
  const [openedFrom, setOpenedFrom] = useState<string | null>(null);
  const sheetOpen = openedFrom === pathname;
  const setSheetOpen = (open: boolean) => setOpenedFrom(open ? pathname : null);

  const overflows = items.length > BAR_SLOTS;
  const barItems = overflows ? items.slice(0, BAR_SLOTS - 1) : items;
  const restItems = overflows ? items.slice(BAR_SLOTS - 1) : [];
  // Keep the current page reachable in the bar even when it lives in the sheet.
  const activeInSheet = overflows && restItems.some((i) => i.href === active);

  return (
    <>
      {sheetOpen && (
        <MoreSheet
          group={group}
          items={restItems}
          active={active}
          onClose={() => setSheetOpen(false)}
        />
      )}

      <nav className="mobile-nav">
        {barItems.map(({ href, icon: Icon, labelShort, ready }) => (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1, textDecoration: 'none', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, background: href === active ? 'rgba(255,255,255,.18)' : 'transparent',
            }}
          >
            <Icon
              size={20}
              color={href === active ? T.white : 'rgba(255,255,255,.65)'}
              strokeWidth={href === active ? 2.5 : 1.8}
            />
            <span style={{
              fontSize: 10,
              fontWeight: href === active ? 700 : 500,
              color: href === active ? T.white : 'rgba(255,255,255,.65)',
              opacity: ready === false ? 0.75 : 1,
            }}>
              {labelShort}
            </span>
          </Link>
        ))}

        {overflows && (
          <button
            type="button"
            aria-label="Menu lainnya"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(!sheetOpen)}
            style={{
              flex: 1, border: 0, cursor: 'pointer', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, background: activeInSheet ? 'rgba(255,255,255,.18)' : 'transparent',
              font: 'inherit', padding: 0,
            }}
          >
            <MoreHorizontal
              size={20}
              color={activeInSheet ? T.white : 'rgba(255,255,255,.65)'}
              strokeWidth={activeInSheet ? 2.5 : 1.8}
            />
            <span style={{
              fontSize: 10,
              fontWeight: activeInSheet ? 700 : 500,
              color: activeInSheet ? T.white : 'rgba(255,255,255,.65)',
            }}>
              Lainnya
            </span>
          </button>
        )}
      </nav>
    </>
  );
}

function MoreSheet({
  group,
  items,
  active,
  onClose,
}: {
  group: NavGroup;
  items: ReturnType<typeof visibleItems>;
  active: string | null;
  onClose: () => void;
}) {
  const other = GROUPS.find((g) => g !== group)!;

  return (
    <div
      role="dialog"
      aria-label="Menu lainnya"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(26,10,0,.45)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '72vh', overflowY: 'auto',
          background: T.white,
          borderRadius: '16px 16px 0 0',
          padding: '14px 14px calc(72px + env(safe-area-inset-bottom))',
          boxShadow: '0 -8px 28px rgba(26,10,0,.22)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: T.charcoal }}>
            {NAV[group].title}
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4 }}
          >
            <X size={19} color={T.charcoal} />
          </button>
        </div>

        {items.map(({ href, icon: Icon, label, section, ready }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 10px', borderRadius: 10, textDecoration: 'none',
              background: href === active ? '#FBF0E8' : 'transparent',
            }}
          >
            <Icon size={18} color={T.primary} strokeWidth={href === active ? 2.5 : 2} />
            <span style={{
              flex: 1, fontSize: 14, color: T.charcoal,
              fontWeight: href === active ? 700 : 500,
            }}>
              {label}
              {section && (
                <span style={{ display: 'block', fontSize: 11, color: '#7A6055', fontWeight: 500 }}>
                  {section}
                </span>
              )}
            </span>
            {ready === false && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 5,
                background: '#F2EAE3', color: '#7A6055',
              }}>
                SOON
              </span>
            )}
          </Link>
        ))}

        <Link
          href={NAV[other].items[0].href}
          style={{
            display: 'block', marginTop: 12, paddingTop: 12,
            borderTop: '1px solid #F2EAE3',
            fontSize: 13, fontWeight: 700, color: T.primary, textDecoration: 'none',
          }}
        >
          Beralih ke grup {NAV[other].title} →
        </Link>
      </div>
    </div>
  );
}
