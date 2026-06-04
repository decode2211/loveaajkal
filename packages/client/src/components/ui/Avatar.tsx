interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border border-border-default ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center font-mono font-medium text-accent-gold ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
