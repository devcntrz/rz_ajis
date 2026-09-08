'use client';

const inputStyle: React.CSSProperties = {
  fontSize: 13, padding: '8px 11px',
  border: '1.5px solid #F0C4A0', borderRadius: 8,
  width: '100%', background: '#FFFFFF', color: '#1A0A00',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

interface InputProps {
  value?:       string | number;
  onChange?:    (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?:   (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?:        string;
  name?:        string;
  id?:          string;
  required?:    boolean;
  disabled?:    boolean;
  style?:       React.CSSProperties;
}

export function Input({ value, onChange, onKeyDown, placeholder, type = 'text', name, id, required, disabled, style }: InputProps) {
  return (
    <input
      type={type} value={value ?? ''} onChange={onChange} onKeyDown={onKeyDown}
      placeholder={placeholder} name={name} id={id}
      required={required} disabled={disabled}
      style={{ ...inputStyle, opacity: disabled ? 0.6 : 1, ...style }}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3, name, id, style }: {
  value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number; name?: string; id?: string;
  style?: React.CSSProperties;
}) {
  return (
    <textarea
      value={value ?? ''} onChange={onChange} placeholder={placeholder}
      rows={rows} name={name} id={id}
      style={{
        ...inputStyle, resize: 'vertical', minHeight: 72, ...style,
      }}
    />
  );
}

export function Sel({ value, onChange, children, name, id, disabled, style }: {
  value?: string; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode; name?: string; id?: string; disabled?: boolean; style?: React.CSSProperties;
}) {
  return (
    <select value={value} onChange={onChange} name={name} id={id} disabled={disabled}
      style={{ ...inputStyle, cursor: 'pointer', opacity: disabled ? 0.6 : 1, ...style }}>
      {children}
    </select>
  );
}

import ReactSelect from 'react-select';

export interface OptionType {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: OptionType[];
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function SearchableSelect({
  options, value, onChange, placeholder, name, id, disabled, style
}: SearchableSelectProps) {
  const selectedOption = options.find(o => o.value === String(value)) || null;

  return (
    <div style={{ width: '100%', ...style }}>
      <ReactSelect
        instanceId={id || name}
        name={name}
        isDisabled={disabled}
        options={options}
        value={selectedOption}
        onChange={(opt) => {
          if (onChange) onChange(opt ? (opt as OptionType).value : '');
        }}
        placeholder={placeholder || 'Pilih...'}
        isClearable={false}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '34px',
            height: '34px',
            fontSize: '13px',
            border: '1.5px solid #F0C4A0',
            borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 1px #F0C4A0' : 'none',
            '&:hover': {
              border: '1.5px solid #F0C4A0',
            },
            background: disabled ? 'rgba(255, 255, 255, 0.6)' : '#FFFFFF',
            color: '#1A0A00',
            fontFamily: 'inherit',
          }),
          valueContainer: (base) => ({
            ...base,
            padding: '0 8px',
          }),
          input: (base) => ({
            ...base,
            margin: '0',
            padding: '0',
            color: '#1A0A00',
          }),
          placeholder: (base) => ({
            ...base,
            color: '#888',
          }),
          singleValue: (base) => ({
            ...base,
            color: '#1A0A00',
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
            borderRadius: '8px',
            border: '1px solid #F0C4A0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontSize: '13px',
            fontFamily: 'inherit',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#F0C4A0' : state.isFocused ? '#FBF0E8' : 'transparent',
            color: state.isSelected ? '#8F3A01' : '#1A0A00',
            cursor: 'pointer',
            padding: '8px 12px',
          }),
          indicatorSeparator: () => ({ display: 'none' }),
          dropdownIndicator: (base) => ({
            ...base,
            padding: '4px',
            color: '#8F3A01',
            '&:hover': {
              color: '#8F3A01',
            },
          }),
        }}
      />
    </div>
  );
}
