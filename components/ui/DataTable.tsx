'use client';
import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface Column<T> {
  key:       string;
  label:     string;
  width:     number;
  sticky?:   boolean;
  /**
   * Ignored — the frozen offset is derived from the widths of the preceding sticky
   * columns. Hand-written offsets drift the moment a column renders wider than its
   * declared width, which lets a scrolling column show through the gap.
   */
  left?:     number;
  sep?:      boolean;
  sortable?: boolean;
  sortKey?:  string;
  /** Optional top-level header spanning consecutive columns with the same text. */
  group?:    string;
  align?:    'left' | 'right' | 'center';
  render:    (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns:     Column<T>[];
  data:        T[];
  rowKey:      (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  /** Selected row uses text color (not cell background). */
  selectedTextColor?: string;
  /** Per-row text color, e.g. to flag inactive records. Selection still wins. */
  rowTextColor?: (row: T) => string | undefined;
  sortBy?:     string;
  sortDir?:    'asc' | 'desc';
  onSort?:     (sortKey: string) => void;
  minWidth?:   number;
  loading?:    boolean;
  emptyText?:  string;
  /**
   * Draw a light vertical rule between every column, not just the `sep` ones.
   * Opt-in: wide spreadsheet-style grids need it to stay readable across many columns,
   * while the narrower tables read better without the extra lines.
   */
  gridLines?:  boolean;
}

const T = {
  primaryPale: '#FBF0E8', primarySoft: '#F0C4A0', primaryDk: '#8F3A01',
  charcoal: '#1A0A00', grayLt: '#F2EAE3', white: '#FFFFFF',
  selectedText: '#1A7A45',
};

/** Freeze edge, so the frozen block reads as a panel rather than a seam. */
const FREEZE_SHADOW = '2px 0 4px -2px rgba(26,10,0,0.28)';

type Layout = { left: number; isLastSticky: boolean };

/** Cumulative offsets for the leading sticky columns. */
function computeLayout<T>(columns: Column<T>[]): Layout[] {
  let acc = 0;
  let lastStickyIndex = -1;
  columns.forEach((c, i) => { if (c.sticky) lastStickyIndex = i; });
  return columns.map((c, i) => {
    const left = acc;
    if (c.sticky) acc += c.width;
    return { left, isLastSticky: i === lastStickyIndex };
  });
}

export function DataTable<Row>({
  columns, data, rowKey, onRowClick, selectedKey,
  selectedTextColor = T.selectedText, rowTextColor,
  sortBy, sortDir = 'asc', onSort,
  minWidth = 900, loading, emptyText = 'Tidak ada data.', gridLines,
}: DataTableProps<Row>) {
  const layout = computeLayout(columns);
  const hasGroups = columns.some(c => c.group);

  /** `sep` stays the heavy group divider; gridLines adds a hairline everywhere else. */
  const ruleOf = (c: Column<Row>) =>
    c.sep ? `2px solid ${T.primarySoft}` : gridLines ? `1px solid ${T.grayLt}` : undefined;

  // Consecutive columns sharing a group label collapse into one spanning header cell.
  const groupCells: Array<{ label: string; span: number; key: string; start: number }> = [];
  if (hasGroups) {
    columns.forEach((c, i) => {
      const label = c.group ?? '';
      const prev = groupCells[groupCells.length - 1];
      if (prev && prev.label === label && label !== '') prev.span += 1;
      else groupCells.push({ label, span: 1, key: `${label}-${c.key}`, start: i });
    });
  }

  if (loading) {
    return (
      <div style={{ background: T.white, borderRadius: 16, border: `1.5px solid ${T.primarySoft}`, overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${T.grayLt}`, display: 'flex', gap: 12 }}>
            {[40, 160, 100, 80, 80, 100].map((w, j) => (
              <div key={j} className="skeleton" style={{ height: 16, width: w, borderRadius: 6 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const stickyStyle = (c: Column<Row>, i: number, bg: string, headerLayer: boolean): React.CSSProperties =>
    c.sticky
      ? {
          position: 'sticky',
          left: layout[i].left,
          // Frozen cells must outrank scrolling cells of the same band; header
          // outranks body so it never gets painted over while scrolling.
          zIndex: headerLayer ? 4 : 2,
          background: bg,
          boxShadow: layout[i].isLastSticky ? FREEZE_SHADOW : undefined,
        }
      : { position: 'static', zIndex: headerLayer ? 3 : 0, background: bg };

  return (
    <div style={{ background: T.white, borderRadius: 16, border: `1.5px solid ${T.primarySoft}`, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          borderCollapse: 'separate', borderSpacing: 0,
          width: '100%', minWidth, tableLayout: 'fixed',
        }}>
          {/* Fixed widths keep the computed sticky offsets exact. */}
          <colgroup>
            {columns.map(c => <col key={c.key} style={{ width: c.width }} />)}
          </colgroup>
          <thead>
            {hasGroups && (
              <tr style={{ background: T.primaryPale }}>
                {groupCells.map(g => {
                  const firstIdx = g.start;
                  const c = columns[firstIdx];
                  return (
                    <th
                      key={g.key}
                      colSpan={g.span}
                      style={{
                        fontSize: 10, fontWeight: 800, color: T.primaryDk, textTransform: 'uppercase',
                        letterSpacing: 0.4, padding: '6px 12px', whiteSpace: 'nowrap',
                        textAlign: g.span > 1 ? 'center' : 'left',
                        borderBottom: `1px solid ${T.primarySoft}`,
                        ...(c && g.span === 1
                          ? stickyStyle(c, firstIdx, T.primaryPale, true)
                          : { background: T.primaryPale, zIndex: 3 }),
                      }}
                    >
                      {g.label}
                    </th>
                  );
                })}
              </tr>
            )}
            <tr style={{ background: T.primaryPale }}>
              {columns.map((c, i) => {
                const colSortKey = c.sortKey || c.key;
                const active = !!c.sortable && sortBy === colSortKey;
                const canSort = !!c.sortable && !!onSort;
                return (
                  <th
                    key={c.key}
                    onClick={() => { if (canSort) onSort(colSortKey); }}
                    style={{
                      fontSize: 11, fontWeight: 800, color: T.primaryDk, textTransform: 'uppercase',
                      letterSpacing: 0.5, padding: '10px 12px', whiteSpace: 'nowrap',
                      textAlign: c.align ?? 'left',
                      borderRight: ruleOf(c),
                      borderBottom: `1.5px solid ${T.primarySoft}`,
                      fontFamily: 'inherit',
                      cursor: canSort ? 'pointer' : undefined,
                      userSelect: 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      ...stickyStyle(c, i, T.primaryPale, true),
                    }}
                  >
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      justifyContent: c.align === 'right' ? 'flex-end' : undefined,
                    }}>
                      {c.label}
                      {canSort && (
                        active
                          ? (sortDir === 'asc'
                            ? <ArrowUp size={12} strokeWidth={2.5} />
                            : <ArrowDown size={12} strokeWidth={2.5} />)
                          : <ArrowUpDown size={12} strokeWidth={2} style={{ opacity: 0.45 }} />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: '#7A6055', fontSize: 14, fontFamily: 'inherit' }}>
                  {emptyText}
                </td>
              </tr>
            )}
            {data.map((row, i) => {
              const key = rowKey(row);
              const selected = selectedKey != null && selectedKey !== '' && key === selectedKey;
              const bg = i % 2 === 0 ? T.white : '#FDFAF8';
              const textColor = selected
                ? selectedTextColor
                : (rowTextColor?.(row) ?? T.charcoal);
              const paint = (el: HTMLElement, color: string) => {
                el.style.background = color;
                el.querySelectorAll('td').forEach(td => {
                  (td as HTMLElement).style.background = color;
                });
              };
              return (
                <tr
                  key={key}
                  data-selected={selected ? '1' : undefined}
                  style={{
                    background: bg,
                    cursor: onRowClick ? 'pointer' : undefined,
                    color: textColor,
                  }}
                  onClick={() => onRowClick?.(row)}
                  onMouseEnter={e => {
                    if (!onRowClick) return;
                    paint(e.currentTarget as HTMLElement, selected ? bg : T.primaryPale);
                  }}
                  onMouseLeave={e => {
                    if (!onRowClick) return;
                    paint(e.currentTarget as HTMLElement, bg);
                  }}
                >
                  {columns.map((c, ci) => (
                    <td key={c.key} style={{
                      fontSize: 12, color: 'inherit', padding: '10px 12px', whiteSpace: 'nowrap',
                      borderRight: ruleOf(c),
                      borderBottom: `1px solid ${T.grayLt}`,
                      fontFamily: 'inherit',
                      textAlign: c.align ?? 'left',
                      fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : undefined,
                      fontWeight: selected ? 700 : undefined,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      ...stickyStyle(c, ci, bg, false),
                    }}>
                      {c.render(row, i)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
