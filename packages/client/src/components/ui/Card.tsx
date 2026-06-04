import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'gold' | 'rose' | 'none';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ glow = 'none', hoverable = false, className = '', children, ...props }, ref) => {
    const glowClass = glow === 'gold' ? 'shadow-gold' : glow === 'rose' ? 'shadow-rose' : '';
    const hoverClass = hoverable
      ? 'cursor-pointer hover:border-border-strong hover:bg-bg-elevated transition-all duration-200'
      : '';

    return (
      <div
        ref={ref}
        className={`bg-bg-surface border border-border-subtle rounded-2xl ${glowClass} ${hoverClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
