import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={inputId}>{label}</label>
      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        style={{
          backgroundColor: "#ffffff",
          color: "var(--color-text)",
          padding: 12,
          border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: 16,
        }}
      />
      {error && (
        <small role="alert" style={{ color: "var(--color-error)" }}>
          {error}
        </small>
      )}
    </div>
  );
}
