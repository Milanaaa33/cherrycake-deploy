import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
};

export default function Card({ title, children, style, className = "", ...props }: CardProps) {
  return (
    <article
      {...props}
      className={`cc-card ${className}`.trim()}
      style={{
        padding: 24,
        border: "1px solid var(--cherry-border, rgba(255, 183, 197, 0.2))",
        borderRadius: "var(--radius-md, 16px)",
        background: "var(--cherry-card, #2d0e24)",
        color: "var(--text-main, #fdf2f5)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
        textAlign: "left",
        ...style,
      }}
    >
      {title && (
        <h3
          style={{
            marginTop: 0,
            marginBottom: 16,
            color: "var(--sakura-pink, #ffb7c5)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.2rem",
            fontWeight: 700
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </article>
  );
}
