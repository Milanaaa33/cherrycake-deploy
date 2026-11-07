import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral';
};

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`cc-badge cc-badge--${variant}`}>{children}</span>;
}
