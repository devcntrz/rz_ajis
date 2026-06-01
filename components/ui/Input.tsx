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
  placeholder?: string;
  type?:        string;
  name?:        string;
  id?:          string;
  required?:    boolean;
  disabled?:    boolean;
  style?:       React.CSSProperties;
}

export function Input({ value, onChange, placeholder, type = 'text', name, id, required, disabled, style }: InputProps) {
  return (
    <input
      type={type} value={value ?? ''} onChange={onChange}
      placeholder={placeholder} name={name} id={id}
      required={required} disabled={disabled}
      style={{ ...inputStyle, opacity: disabled ? 0.6 : 1, ...style }}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3, name, id }: {
  value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number; name?: string; id?: string;
}) {
  return (
    <textarea
      value={value ?? ''} onChange={onChange} placeholder={placeholder}
      rows={rows} name={name} id={id}
      style={{
        ...inputStyle, resize: 'vertical', minHeight: 72,
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
