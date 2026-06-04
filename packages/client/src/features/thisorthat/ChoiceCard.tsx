import { motion } from 'framer-motion';

interface ChoiceCardProps {
  emoji: string;
  label: string;
  side: 'A' | 'B';
  isMyChoice: boolean;
  isPartnerChoice: boolean;
  bothChose: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function ChoiceCard({
  emoji,
  label,
  side,
  isMyChoice,
  isPartnerChoice,
  bothChose,
  disabled,
  onClick,
}: ChoiceCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative rounded-2xl border p-6 text-center transition-all duration-200 min-h-[140px]
        flex flex-col items-center justify-center gap-3 w-full
        ${isMyChoice
          ? 'border-accent-gold bg-accent-gold/10 shadow-gold'
          : 'border-border-subtle bg-bg-surface hover:border-accent-gold/40 hover:bg-bg-hover'
        }
        disabled:cursor-not-allowed
      `}
      aria-label={`Choose option ${side}: ${label}`}
      aria-pressed={isMyChoice}
    >
      <span className="text-4xl">{emoji}</span>
      <span className={`text-sm font-medium leading-snug ${isMyChoice ? 'text-accent-gold' : 'text-text-secondary'}`}>
        {label}
      </span>

      {/* "Both" badge */}
      {bothChose && (
        <motion.div
          className="absolute -top-2.5 -right-2.5 bg-accent-gold text-bg-base text-[10px] font-mono rounded-full px-2 py-0.5 shadow-gold"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          Both 💫
        </motion.div>
      )}

      {/* My choice only */}
      {isMyChoice && !isPartnerChoice && (
        <div className="absolute -top-2 -right-2 bg-bg-elevated border border-border-default text-text-tertiary text-[10px] font-mono rounded-full px-1.5 py-0.5">
          Me
        </div>
      )}

      {/* Partner choice only */}
      {isPartnerChoice && !isMyChoice && (
        <div className="absolute -top-2 -left-2 bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-[10px] font-mono rounded-full px-1.5 py-0.5">
          Them
        </div>
      )}
    </motion.button>
  );
}
