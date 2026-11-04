import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  title: string;
  children: ReactNode;
};

export default function Card({
  title,
  children,
  style,
  ...props
}: CardProps) {
  return (
    <article
      {...props}
      style={{
        padding: 24,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'white',
        color: 'var(--color-text)',
        textAlign: 'left',
        ...style,
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </article>
  );
}
