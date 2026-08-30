import styles from './RadioGroup.module.css';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  direction?: 'horizontal' | 'vertical';
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  direction = 'vertical',
}: RadioGroupProps) {
  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={`${styles.options} ${styles[direction]}`}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={styles.input}
            />
            <span className={styles.radio}>
              <span className={styles.radioInner} />
            </span>
            <div className={styles.optionContent}>
              <span className={styles.optionLabel}>{option.label}</span>
              {option.description && (
                <span className={styles.optionDescription}>{option.description}</span>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
