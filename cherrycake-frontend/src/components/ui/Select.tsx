import type { SelectHTMLAttributes } from "react";
import { useId } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
};

export default function Select({
  label,
  options,
  error,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={selectId}>{label}</label>
      <select
        {...props}
        id={selectId}
        aria-invalid={Boolean(error)}
        style={{
          minHeight: 44,
          padding: 12,
          border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: 16,
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <small role="alert" style={{ color: "var(--color-error)" }}>
          {error}
        </small>
      )}
    </div>
  );
}
