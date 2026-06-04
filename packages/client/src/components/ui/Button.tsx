import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-bg-base',
  ghost: 'border border-transparent text-text-secondary hover:text-text-primary hover:border-border-default',
  outline: 'border border-border-default text-text-primary hover:border-accent-gold hover:text-accent-gold',
  danger: 'border border-accent-rose text-accent-rose hover:bg-accent-rose hover:text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`
          inline-flex items-center justify-center gap-2 font-sans font-medium
          transition-all duration-200 cursor-pointer select-none
          disabled:opacity-40 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        disabled={disabled || loading}
        {...(props as React.ComponentPropsWithRef<typeof motion.button>)}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
