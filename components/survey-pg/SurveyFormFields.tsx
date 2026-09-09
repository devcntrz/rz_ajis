'use client';

/**
 * Minimal radio/checkbox primitives for the legacy-style Data Survey form
 * (components/survey-pg/SurveyPgForm.tsx). There is no radio/checkbox
 * primitive in components/ui/, so these are small, local, and styled with
 * the same tokens the rest of the app's forms already use (CLAUDE.md §5).
 *
 * Both are intentionally "dumb": they just track a selected value (radio) or
 * comma-joined label string (checkbox). Any "Lainnya"-style companion text
 * input, and how it's folded into the stored string, is composed by the
 * caller (SurveyPgForm) — the mapping differs per field (some store the
 * label, some store only the free text, some store "Label: text", etc.), so
 * baking one convention into the primitive would fight half its callers.
 */

const optionRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1A0A00',
  cursor: 'pointer', marginBottom: 6,
};

export interface RadioOption {
  value: string;
  label: string;
}

export function RadioGroup({
  name, options, value, onChange,
}: {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      {options.map(opt => (
        <label key={opt.value} style={optionRowStyle}>
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export interface CheckboxOption {
  value: string;
  label: string;
}

/**
 * Checkbox group whose selection is exposed/consumed as a comma-joined
 * string of labels (matches the single varchar(100) column each of these
 * fields maps to — e.g. kepemilikan_kendaraan, kepemilikan_barang_elektronik).
 */
export function CheckboxGroup({
  name, options, value, onChange,
}: {
  name: string;
  options: CheckboxOption[];
  /** Comma-joined selected labels. */
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggle = (label: string) => {
    const next = selected.includes(label) ? selected.filter(l => l !== label) : [...selected, label];
    onChange(next.join(', '));
  };

  return (
    <div>
      {options.map(opt => (
        <label key={opt.value} style={optionRowStyle}>
          <input type="checkbox" name={name} checked={selected.includes(opt.label)} onChange={() => toggle(opt.label)} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
