'use client';

interface FormInputProps {
    label: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    required?: boolean;
    readOnly?: boolean;
}

export function FormInput({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required,
    readOnly,
}: FormInputProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#1a1a1a',
                letterSpacing: '0.03em',
            }}>
                {label}
                {required && <span style={{ color: '#C05A3C', marginLeft: 2 }}>*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
                style={{
                    padding: '10px 14px',
                    border: '1px solid #E0DDD8',
                    borderRadius: 6,
                    background: readOnly ? '#F5F3EF' : '#FFFFFF',
                    fontSize: 14,
                    color: '#1a1a1a',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                    width: '100%',
                    boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                    if (!readOnly) {
                        e.target.style.borderColor = '#C05A3C';
                    }
                }}
                onBlur={(e) => {
                    if (!readOnly) {
                        e.target.style.borderColor = '#E0DDD8';
                    }
                }}
            />
        </div>
    );
}

interface FormSelectProps {
    label: string;
    placeholder?: string;
    options: { label: string; value: string }[];
    value?: string;
    onChange?: (value: string) => void;
}

export function FormSelect({
    label,
    placeholder,
    options,
    value,
    onChange,
}: FormSelectProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#1a1a1a',
                letterSpacing: '0.03em',
            }}>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                style={{
                    padding: '10px 14px',
                    border: '1px solid #E0DDD8',
                    borderRadius: 6,
                    background: '#FFFFFF',
                    fontSize: 14,
                    color: '#1a1a1a',
                    outline: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                }}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
