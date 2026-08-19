'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface RowAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface RowActionsProps {
  items: RowAction[];
  /** Accessible label for the trigger, e.g. the row's subject. */
  label?: string;
}

const MENU_WIDTH = 190;

/**
 * Per-row "⋮" menu.
 *
 * The menu is rendered into document.body rather than next to the trigger:
 * DataTable puts `overflow: hidden` on every cell (for ellipsis) and
 * `overflow-x: auto` on the table wrapper, so an absolutely positioned menu
 * inside the cell would be clipped twice.
 */
export function RowActions({ items, label = 'Aksi baris' }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const height = items.length * 38 + 8;
    // Flip above the trigger when there isn't room below.
    const below = window.innerHeight - r.bottom;
    const top = below < height + 8 ? r.top - height - 4 : r.bottom + 4;
    const left = Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8);
    setPos({ top, left: Math.max(8, left) });
  }, [items.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;

    const onDocPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    // Any scroll moves the trigger, which makes the portal position stale.
    const onScroll = () => setOpen(false);

    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={e => {
          // The row itself is clickable; opening the menu must not also select it.
          e.stopPropagation();
          setOpen(o => !o);
        }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
          border: `1px solid ${open ? '#BF4E02' : '#F0C4A0'}`,
          background: open ? '#FBF0E8' : '#FFFFFF',
          color: '#8F3A01',
        }}
      >
        <MoreVertical size={16} />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH,
            background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 12,
            boxShadow: '0 10px 24px -8px rgba(26,10,0,.35)',
            padding: 4, zIndex: 1000,
          }}
        >
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => { setOpen(false); item.onClick(); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 10px', borderRadius: 8, border: 'none',
                background: 'transparent', fontFamily: 'inherit', fontSize: 13,
                fontWeight: 600, cursor: item.disabled ? 'not-allowed' : 'pointer',
                color: item.disabled ? '#7A6055' : item.danger ? '#B02020' : '#1A0A00',
                opacity: item.disabled ? 0.55 : 1,
              }}
              onMouseEnter={e => {
                if (item.disabled) return;
                (e.currentTarget as HTMLElement).style.background = '#FBF0E8';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
