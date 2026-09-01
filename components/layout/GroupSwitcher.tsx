'use client';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { GROUPS, NAV, type NavGroup } from './navConfig';

const T = { white: '#FFFFFF' };

interface GroupSwitcherProps {
  group: NavGroup;
}

/**
 * Switches the sidebar between the transition menus (MySQL, live today) and the
 * production menus (Neon Postgres, PRD §4).
 *
 * A native <select> on purpose: two options do not justify a custom popover, and
 * the native control brings keyboard and screen-reader behaviour for free.
 */
export function GroupSwitcher({ group }: GroupSwitcherProps) {
  const router = useRouter();

  function onChange(next: NavGroup) {
    if (next === group) return;
    try {
      localStorage.setItem('ajis.navGroup', next);
    } catch {
      // private mode or blocked site data — the pathname still decides the group
    }
    router.push(NAV[next].items[0].href);
  }

  return (
    <div style={{ position: 'relative', marginTop: 12 }}>
      <select
        aria-label="Pilih grup menu"
        value={group}
        onChange={(e) => onChange(e.target.value as NavGroup)}
        style={{
          appearance: 'none',
          width: '100%',
          padding: '8px 30px 8px 10px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,.28)',
          background: 'rgba(255,255,255,.14)',
          color: T.white,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {GROUPS.map((g) => (
          // Options render in the OS palette, so they need readable colors of their own
          <option key={g} value={g} style={{ color: '#1A0A00', background: '#FFFFFF' }}>
            {NAV[g].title}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        style={{
          position: 'absolute',
          right: 9,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'rgba(255,255,255,.75)',
        }}
      />

      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.6)', marginTop: 5, fontWeight: 500 }}>
        {NAV[group].blurb}
      </div>
    </div>
  );
}
