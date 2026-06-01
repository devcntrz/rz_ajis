'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { FLabel } from '@/components/ui/FLabel';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SEARCH_SELECT_LIMIT } from '@/lib/searchSelect';

const inputStyle: React.CSSProperties = {
  fontSize: 13,
  padding: '8px 11px',
  border: '1.5px solid #F0C4A0',
  borderRadius: 8,
  width: '100%',
  background: '#FFFFFF',
  color: '#1A0A00',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

interface MultiSearchSelectProps {
  label?:       string;
  value:        string[];
  onChange:     (values: string[]) => void;
  fetchUrl:     string;
  placeholder?: string;
  disabled?:    boolean;
}

export function MultiSearchSelect({
  label = 'Pemateri (pilih satu atau lebih)',
  value,
  onChange,
  fetchUrl,
  placeholder = 'Ketik nama pemateri...',
  disabled = false,
}: MultiSearchSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [options, setOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const sep = fetchUrl.includes('?') ? '&' : '?';
      const res = await fetch(
        `${fetchUrl}${sep}q=${encodeURIComponent(q)}&limit=${SEARCH_SELECT_LIMIT}`,
      );
      const json = await res.json();
      const rows = (json.data ?? []) as Array<{ id_sdm: string; nama_lengkap: string }>;
      setOptions(
        rows
          .filter(r => !value.includes(r.nama_lengkap))
          .map(r => ({ id: r.id_sdm, label: r.nama_lengkap })),
      );
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, value]);

  useEffect(() => {
    if (!open) return;
    load(debouncedQuery);
  }, [open, debouncedQuery, load]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function add(label: string) {
    if (disabled || value.includes(label)) return;
    onChange([...value, label]);
    setQuery('');
  }

  function remove(label: string) {
    if (disabled) return;
    onChange(value.filter(v => v !== label));
  }

  return (
    <div ref={rootRef}>
      <FLabel>{label}</FLabel>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {value.map(name => (
            <span
              key={name}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#FBF0E8', border: '1px solid #F0C4A0', borderRadius: 20,
                padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#8F3A01',
              }}
            >
              {name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }}
        />
        {open && !disabled && (
          <ul
            id={listId}
            role="listbox"
            style={{
              position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 8,
              boxShadow: '0 8px 24px rgba(26,10,0,.12)', maxHeight: 220, overflowY: 'auto',
              listStyle: 'none', margin: 0, padding: 4,
            }}
          >
            {loading && (
              <li style={{ padding: '10px 12px', fontSize: 12, color: '#7A6055' }}>Memuat...</li>
            )}
            {!loading && options.length === 0 && (
              <li style={{ padding: '10px 12px', fontSize: 12, color: '#7A6055' }}>
                {query.trim() ? 'Tidak ditemukan' : 'Ketik untuk mencari pemateri'}
              </li>
            )}
            {!loading && options.map(opt => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => { add(opt.label); setOpen(true); }}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', background: 'transparent',
                    padding: '9px 12px', fontSize: 13, cursor: 'pointer', borderRadius: 6,
                    fontFamily: 'inherit',
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
