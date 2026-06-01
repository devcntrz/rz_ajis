'use client';
import React from 'react';

interface Column<T> {
  key:     string;
  label:   string;
  width:   number;
  sticky?: boolean;
  left?:   number;
  sep?:    boolean;
  render:  (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns:    Column<T>[];
  data:       T[];
  rowKey:     (row: T) => string;
  onRowClick?: (row: T) => void;
  minWidth?:  number;
  loading?:   boolean;
  emptyText?: string;
}

const T = {
  primaryPale: '#FBF0E8', primarySoft: '#F0C4A0', primaryDk: '#8F3A01',
  charcoal: '#1A0A00', grayLt: '#F2EAE3', white: '#FFFFFF',
};

export function DataTable<Row>({
  columns, data, rowKey, onRowClick, minWidth = 900, loading, emptyText = 'Tidak ada data.',
}: DataTableProps<Row>) {
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

  return (
    <div style={{ background: T.white, borderRadius: 16, border: `1.5px solid ${T.primarySoft}`, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth }}>
          <thead>
            <tr style={{ background: T.primaryPale }}>
              {columns.map(c => (
                <th key={c.key} style={{
                  fontSize: 11, fontWeight: 800, color: T.primaryDk, textTransform: 'uppercase',
                  letterSpacing: 0.5, padding: '10px 12px', whiteSpace: 'nowrap', textAlign: 'left',
                  position: c.sticky ? 'sticky' : 'static', left: c.sticky ? c.left : undefined,
                  background: T.primaryPale, zIndex: c.sticky ? 2 : 1,
                  borderRight: c.sep ? `2px solid ${T.primarySoft}` : undefined,
                  borderBottom: `1.5px solid ${T.primarySoft}`, minWidth: c.width,
                  fontFamily: 'inherit',
                }}>
                  {c.label}
                </th>
              ))}
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
              const bg = i % 2 === 0 ? T.white : '#FDFAF8';
              return (
                <tr
                  key={rowKey(row)}
                  style={{ background: bg, cursor: onRowClick ? 'pointer' : undefined }}
                  onClick={() => onRowClick?.(row)}
                  onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = T.primaryPale; }}
                  onMouseLeave={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = bg; }}
                >
                  {columns.map(c => (
                    <td key={c.key} style={{
                      fontSize: 12, color: T.charcoal, padding: '10px 12px', whiteSpace: 'nowrap',
                      position: c.sticky ? 'sticky' : 'static', left: c.sticky ? c.left : undefined,
                      background: bg, zIndex: c.sticky ? 1 : 0,
                      borderRight: c.sep ? `2px solid ${T.primarySoft}` : undefined,
                      minWidth: c.width, fontFamily: 'inherit',
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
