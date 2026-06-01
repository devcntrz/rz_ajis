'use client';

const T = {
  primary: '#BF4E02', primaryPale: '#FBF0E8',
  red: '#B02020', redPale: '#FDEAEA',
  gray: '#7A6055', grayLt: '#F2EAE3',
  white: '#FFFFFF', charcoal: '#1A0A00',
};

type BtnVariant = 'primary' | 'outline' | 'danger' | 'ghost';
type BtnSize    = 'sm' | 'md';

interface BtnProps {
  children:  React.ReactNode;
  onClick?:  () => void;
  variant?:  BtnVariant;
  size?:     BtnSize;
  type?:     'button' | 'submit' | 'reset';
  disabled?: boolean;
  style?:    React.CSSProperties;
}

export function Btn({ children, onClick, variant = 'outline', size = 'md', type = 'button', disabled, style }: BtnProps) {
  const sz = size === 'sm'
    ? { fontSize: 12, padding: '6px 13px' }
    : { fontSize: 13, padding: '9px 18px' };

  const v = variant === 'primary'
    ? { background: T.primary, color: T.white, border: 'none' }
    : variant === 'danger'
    ? { background: T.redPale, color: T.red, border: `1.5px solid ${T.red}40` }
    : variant === 'ghost'
    ? { background: 'transparent', color: T.gray, border: 'none' }
    : { background: 'transparent', color: T.primary, border: `1.5px solid ${T.primary}` };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 700, borderRadius: 8,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        opacity: disabled ? 0.6 : 1,
        fontFamily: 'inherit',
        ...sz, ...v, ...style,
      }}
    >
      {children}
    </button>
  );
}
