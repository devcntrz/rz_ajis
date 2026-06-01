'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { FLabel } from '@/components/ui/FLabel';
import { Btn } from '@/components/ui/Btn';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { JENIS_PEMBINAAN_OPTIONS } from '@/lib/pembinaanConstants';
import { useCurrentSemester } from '@/hooks/useCurrentSemester';

const jenisOptions = JENIS_PEMBINAAN_OPTIONS.map(j => ({ value: j, label: j }));

interface PembinaanFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

interface FilterDraft {
  q: string;
  jenis: string;
  semester: string;
  semesterLabel: string;
  tgl_dari: string;
  tgl_sampai: string;
}

function semesterDisplayLabel(s: { semester: string; is_current: boolean | number | string }): string {
  const isCurrent = s.is_current === true || s.is_current === 1 || s.is_current === '1';
  return `${s.semester}${isCurrent ? ' (Aktif)' : ''}`;
}

export function PembinaanFilter({ onFilterChange }: PembinaanFilterProps) {
  const { current: activeSemester } = useCurrentSemester();
  const appliedOnce = useRef(false);

  const [draft, setDraft] = useState<FilterDraft>({
    q: '', jenis: '', semester: '', semesterLabel: '', tgl_dari: '', tgl_sampai: '',
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!activeSemester || appliedOnce.current) return;
    const label = semesterDisplayLabel(activeSemester);
    setDraft(d => ({
      ...d,
      semester: activeSemester.semesterid,
      semesterLabel: label,
    }));
    onFilterChange({
      q: '',
      jenis: '',
      semester: activeSemester.semesterid,
      tgl_dari: '',
      tgl_sampai: '',
    });
    appliedOnce.current = true;
  }, [activeSemester, onFilterChange]);

  function applyFilters() {
    onFilterChange({
      q:          draft.q,
      jenis:      draft.jenis,
      semester:   draft.semester,
      tgl_dari:   draft.tgl_dari,
      tgl_sampai: draft.tgl_sampai,
    });
  }

  function resetFilters() {
    const semester = activeSemester?.semesterid ?? '';
    const label = activeSemester ? semesterDisplayLabel(activeSemester) : '';
    const empty: FilterDraft = {
      q: '', jenis: '', semester: '', semesterLabel: '', tgl_dari: '', tgl_sampai: '',
    };
    const withSem: FilterDraft = semester
      ? { ...empty, semester, semesterLabel: label }
      : empty;
    setDraft(withSem);
    onFilterChange({
      q: '', jenis: '', semester, tgl_dari: '', tgl_sampai: '',
    });
  }

  return (
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 16,
      padding: '14px 18px', marginBottom: 18,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} color="#7A6055" style={{ position: 'absolute', left: 11, top: 11 }} />
          <Input
            value={draft.q}
            onChange={e => setDraft(d => ({ ...d, q: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') applyFilters(); }}
            placeholder="Cari tema / materi pembinaan..."
            style={{ paddingLeft: 34 }}
          />
        </div>
        <Btn onClick={() => setExpanded(!expanded)} variant="outline" style={{ height: 38 }}>
          <SlidersHorizontal size={15} />
          <span>Filter</span>
        </Btn>
        <Btn onClick={applyFilters} variant="primary" style={{ height: 38 }}>
          <Search size={15} />
          <span>Cari</span>
        </Btn>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F2EAE3' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}>
            <div>
              <FLabel>Jenis Pembinaan</FLabel>
              <SearchSelect
                options={jenisOptions}
                value={draft.jenis}
                onChange={v => setDraft(d => ({ ...d, jenis: v }))}
                placeholder="Ketik jenis..."
                allowEmpty
                clearable
              />
            </div>

            <div>
              <FLabel>Semester</FLabel>
              <SearchSelect
                fetchUrl="/api/anakjuara/semester"
                value={draft.semester}
                onChange={v => setDraft(d => ({
                  ...d,
                  semester: v,
                  semesterLabel: v ? d.semesterLabel : '',
                }))}
                onLabelChange={label => setDraft(d => ({ ...d, semesterLabel: label }))}
                resolvedLabel={draft.semesterLabel || undefined}
                placeholder="Ketik semester..."
                allowEmpty
                clearable
              />
            </div>

            <div>
              <FLabel>Dari Tanggal</FLabel>
              <Input
                type="date"
                value={draft.tgl_dari}
                onChange={e => setDraft(d => ({ ...d, tgl_dari: e.target.value }))}
              />
            </div>

            <div>
              <FLabel>Sampai Tanggal</FLabel>
              <Input
                type="date"
                value={draft.tgl_sampai}
                onChange={e => setDraft(d => ({ ...d, tgl_sampai: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <Btn type="button" onClick={resetFilters} variant="outline" size="sm">
              <RotateCcw size={14} />
              <span>Reset</span>
            </Btn>
            <Btn type="button" onClick={applyFilters} variant="primary" size="sm">
              <Search size={14} />
              <span>Terapkan Filter</span>
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
