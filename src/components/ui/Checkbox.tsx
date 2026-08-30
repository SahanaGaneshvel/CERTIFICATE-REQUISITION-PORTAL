import React from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  id?: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  error,
  disabled = false,
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={styles.wrapper}>
      <label
        htmlFor={checkboxId}
        className={`${styles.label} ${disabled ? styles.disabled : ''}`}
      >
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={styles.input}
        />
        <span className={`${styles.checkbox} ${checked ? styles.checked : ''}`}>
          {checked && <Check size={14} />}
        </span>
        <span className={styles.text}>{label}</span>
      </label>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
