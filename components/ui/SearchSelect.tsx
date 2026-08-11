'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SEARCH_SELECT_LIMIT, type SearchSelectOption } from '@/lib/searchSelect';

const inputStyle: React.CSSProperties = {
  fontSize: 13,
  padding: '8px 32px 8px 11px',
  border: '1.5px solid #F0C4A0',
  borderRadius: 8,
  width: '100%',
  background: '#FFFFFF',
  color: '#1A0A00',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

interface SearchSelectBaseProps {
  value:          string;
  onChange:       (value: string) => void;
  onLabelChange?: (label: string) => void;
  placeholder?:   string;
  disabled?:      boolean;
  clearable?:     boolean;
  allowEmpty?:    boolean;
  emptyLabel?:    string;
  style?:         React.CSSProperties;
}

interface StaticSearchSelectProps extends SearchSelectBaseProps {
  options: SearchSelectOption[];
}

interface AsyncSearchSelectProps extends SearchSelectBaseProps {
  fetchUrl: string;
  resolvedLabel?: string;
}

type SearchSelectProps = StaticSearchSelectProps | AsyncSearchSelectProps;

function isAsync(props: SearchSelectProps): props is AsyncSearchSelectProps {
  return 'fetchUrl' in props;
}

function semesterLabelFromRow(row: Record<string, unknown>): string {
  const ic = row.is_current;
  const isCurrent = ic === true || ic === 1 || ic === '1';
  return `${String(row.semester)}${isCurrent ? ' (Aktif)' : ''}`;
}

export function SearchSelect(props: SearchSelectProps) {
  const {
    value,
    onChange,
    onLabelChange,
    placeholder = 'Ketik untuk mencari...',
    disabled = false,
    clearable = false,
    allowEmpty = false,
    emptyLabel = 'Semua',
    style,
  } = props;

  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [committedLabel, setCommittedLabel] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const [asyncOptions, setAsyncOptions] = useState<SearchSelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const staticOptions = isAsync(props) ? [] : props.options;
  const fetchUrl = isAsync(props) ? props.fetchUrl : null;
  const resolvedLabel = isAsync(props) ? props.resolvedLabel : undefined;

  const selectedStatic = staticOptions.find(o => o.value === value);

  useEffect(() => {
    if (resolvedLabel) {
      setCommittedLabel(resolvedLabel);
    }
  }, [resolvedLabel]);

  useEffect(() => {
    if (selectedStatic) {
      setCommittedLabel(selectedStatic.label);
      onLabelChange?.(selectedStatic.label);
    }
  }, [selectedStatic, onLabelChange]);

  useEffect(() => {
    if (!value) {
      setCommittedLabel('');
      return;
    }
    if (!fetchUrl || resolvedLabel || selectedStatic) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${fetchUrl}?q=&limit=${SEARCH_SELECT_LIMIT}`);
        const json = await res.json();
        const rows = (json.data ?? []) as Array<Record<string, unknown>>;
        const match = rows.find(r => String(r.semesterid) === value);
        if (!cancelled && match?.semester) {
          const label = semesterLabelFromRow(match);
          setCommittedLabel(label);
          onLabelChange?.(label);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [value, fetchUrl, resolvedLabel, selectedStatic, onLabelChange]);

  const loadAsync = useCallback(async (q: string) => {
    if (!fetchUrl) return;
    setLoading(true);
    try {
      const sep = fetchUrl.includes('?') ? '&' : '?';
      const res = await fetch(
        `${fetchUrl}${sep}q=${encodeURIComponent(q)}&limit=${SEARCH_SELECT_LIMIT}`,
      );
      const json = await res.json();
      const rows = (json.data ?? []) as Array<Record<string, unknown>>;
      setAsyncOptions(
        rows.map(row => ({
          value: String(row.semesterid ?? row.value ?? row.id_anak ?? row.id_sdm ?? ''),
          label: row.semester
            ? semesterLabelFromRow(row)
            : String(row.nama_lengkap ?? row.nama_anak ?? row.label ?? row.value ?? ''),
        })).filter(o => o.value),
      );
    } catch {
      setAsyncOptions([]);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  useEffect(() => {
    if (!fetchUrl || !open) return;
    loadAsync(debouncedQuery);
  }, [fetchUrl, open, debouncedQuery, loadAsync]);

  const filteredStatic = staticOptions.filter(o => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q);
  }).slice(0, SEARCH_SELECT_LIMIT);

  const listOptions = fetchUrl ? asyncOptions : filteredStatic;

  const inputDisplay = open
    ? (query.length > 0 ? query : committedLabel)
    : committedLabel;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function pick(opt: SearchSelectOption) {
    onChange(opt.value);
    setCommittedLabel(opt.label);
    onLabelChange?.(opt.label);
    setQuery('');
    setOpen(false);
  }

  function clear() {
    onChange('');
    setCommittedLabel('');
    onLabelChange?.('');
    setQuery('');
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', ...style }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          placeholder={placeholder}
          value={inputDisplay}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            if (!fetchUrl && !e.target.value) {
              onChange('');
              setCommittedLabel('');
            }
          }}
          onFocus={() => setOpen(true)}
          style={{
            ...inputStyle,
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            fontWeight: value && !open ? 600 : 400,
            color: value ? '#1A0A00' : '#7A6055',
          }}
        />
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={clear}
            style={{
              position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            }}
          >
            <X size={14} color="#7A6055" />
          </button>
        )}
        <ChevronDown
          size={16}
          color="#7A6055"
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, marginTop: 4,
            background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(26,10,0,.12)', maxHeight: 240, overflowY: 'auto',
            listStyle: 'none', margin: 0, padding: 4,
          }}
        >
          {loading && (
            <li style={{ padding: '10px 12px', fontSize: 12, color: '#7A6055' }}>Memuat...</li>
          )}
          {!loading && allowEmpty && (
            <li>
              <button
                type="button"
                onClick={() => pick({ value: '', label: emptyLabel })}
                style={optionBtnStyle(value === '')}
              >
                {emptyLabel}
              </button>
            </li>
          )}
          {!loading && listOptions.length === 0 && (
            <li style={{ padding: '10px 12px', fontSize: 12, color: '#7A6055' }}>
              {query.trim() ? 'Tidak ditemukan' : 'Ketik untuk mencari'}
            </li>
          )}
          {!loading && listOptions.map(opt => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => pick(opt)}
                style={optionBtnStyle(opt.value === value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function optionBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: '100%', textAlign: 'left', border: 'none', background: active ? '#FBF0E8' : 'transparent',
    padding: '9px 12px', fontSize: 13, color: '#1A0A00', cursor: 'pointer', borderRadius: 6,
    fontFamily: 'inherit', fontWeight: active ? 700 : 400,
  };
}
