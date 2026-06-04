import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'rose' | 'sage' | 'sky' | 'default';
}

const variants = {
  gold: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
  rose: 'bg-accent-rose/10 text-accent-rose border-accent-rose/30',
  sage: 'bg-accent-sage/10 text-accent-sage border-accent-sage/30',
  sky: 'bg-accent-sky/10 text-accent-sky border-accent-sky/30',
  default: 'bg-bg-hover text-text-secondary border-border-default',
};

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
