import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`cc-button cc-button--${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
