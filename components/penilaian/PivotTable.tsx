'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { NilaiBadge } from '@/components/ui/NilaiBadge';
import { ASPEK_CERDAS_ITEMS, ASPEK_MANDIRI_ITEMS } from '@/types/penilaian';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PivotRow {
  id_anak:            string;
  nama_lengkap:       string;
  jenjang_pendidikan: string;
  nama_wilayah:       string;
  aspects:            Record<string, string>; // aspekName -> hasil_akhir (grade)
}

interface PivotTableProps {
  semester: string;
  wilayah:  string;
  q:        string;
}

const allColumns = [
  ...ASPEK_CERDAS_ITEMS.map(i => i.aspek),
  ...ASPEK_MANDIRI_ITEMS.map(i => i.aspek),
];

export function PivotTable({ semester, wilayah, q }: PivotTableProps) {
  const queryParams = new URLSearchParams({
    pivot: 'true',
    semester,
  });
  if (wilayah) queryParams.append('wilayah', wilayah);
  if (q) queryParams.append('q', q);

  const { data: res, error, isLoading } = useSWR<{ data: PivotRow[] }>(
    `/api/anakjuara/penilaian?${queryParams.toString()}`,
    fetcher,
  );

  const rawData = res?.data ?? [];

  // Dropdown filter states for each aspect column
  const [filters, setFilters] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1.5px solid #F0C4A0', padding: 18 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 36, marginBottom: 10, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (error) return <div style={{ color: '#B02020' }}>Gagal memuat pivot table.</div>;

  const handleFilterChange = (colName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [colName]: value,
    }));
  };

  // Apply filters
  const filteredData = rawData.filter(row => {
    return Object.entries(filters).every(([colName, filterVal]) => {
      if (!filterVal) return true;
      const cellVal = row.aspects[colName];
      if (filterVal === 'Belum') {
        return !cellVal;
      }
      return cellVal === filterVal;
    });
  });

  const filterOptions = ['Excellent', 'Good', 'Average', 'Below Average', 'Poor', 'Belum'];

  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1600 }}>
          <thead>
            {/* Header Labels */}
            <tr style={{ background: '#FBF0E8', borderBottom: '1.5px solid #F0C4A0' }}>
              <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', width: 90, position: 'sticky', left: 0, background: '#FBF0E8', zIndex: 10 }}>ID Anak</th>
              <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', width: 180, position: 'sticky', left: 90, background: '#FBF0E8', zIndex: 10, borderRight: '2px solid #F0C4A0' }}>Nama Lengkap</th>
              {allColumns.map(col => (
                <th key={col} style={{ padding: '12px 10px', fontSize: 10, fontWeight: 800, color: '#8F3A01', textTransform: 'uppercase', width: 140, textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                    <span style={{ height: 28, display: 'flex', alignItems: 'center', textAlign: 'center', lineHeight: 1.1 }}>{col}</span>
                    <select
                      value={filters[col] || ''}
                      onChange={e => handleFilterChange(col, e.target.value)}
                      style={{
                        fontSize: 9, padding: '3px 4px', border: '1px solid #D9CFC8',
                        borderRadius: 4, width: '100%', background: '#FFFFFF', cursor: 'pointer', outline: 'none',
                      }}
                    >
                      <option value="">Semua</option>
                      {filterOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={allColumns.length + 2} style={{ textAlign: 'center', padding: 40, color: '#7A6055', fontSize: 13 }}>
                  Tidak ada data yang cocok dengan filter.
                </td>
              </tr>
            )}
            {filteredData.map((row, i) => {
              const rowBg = i % 2 === 0 ? '#FFFFFF' : '#FDFAF8';
              return (
                <tr key={row.id_anak} style={{ borderBottom: '1px solid #F2EAE3', background: rowBg }}>
                  {/* Sticky ID */}
                  <td style={{
                    padding: '10px 10px', fontSize: 12, fontWeight: 700, color: '#BF4E02',
                    position: 'sticky', left: 0, background: rowBg, zIndex: 5,
                  }}>
                    {row.id_anak}
                  </td>
                  {/* Sticky Nama */}
                  <td style={{
                    padding: '10px 10px', fontSize: 12, fontWeight: 800, color: '#1A0A00',
                    position: 'sticky', left: 90, background: rowBg, zIndex: 5,
                    borderRight: '2px solid #F0C4A0',
                  }}>
                    <div>
                      <div>{row.nama_lengkap}</div>
                      <div style={{ fontSize: 10, color: '#7A6055', fontWeight: 500 }}>{row.jenjang_pendidikan}</div>
                    </div>
                  </td>
                  {/* Aspect Values */}
                  {allColumns.map(col => {
                    const val = row.aspects[col];
                    return (
                      <td key={col} style={{ padding: '10px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <NilaiBadge nilai={val} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
