import { motion } from 'framer-motion';

interface PreferenceItem {
  id: number;
  category: string;
  myChoice: 0 | 1 | null;
  partnerChoice: 0 | 1 | null;
}

interface AlignmentViewProps {
  preferences: PreferenceItem[];
}

const CATEGORIES = ['lifestyle', 'food', 'travel', 'romance', 'entertainment'] as const;

const categoryEmoji: Record<string, string> = {
  lifestyle: '🌿',
  food: '🍜',
  travel: '✈️',
  romance: '💌',
  entertainment: '🎬',
};

export function AlignmentView({ preferences }: AlignmentViewProps) {
  const mutual = preferences.filter(
    (p) => p.myChoice !== null && p.partnerChoice !== null,
  );
  const aligned = mutual.filter((p) => p.myChoice === p.partnerChoice);
  const alignmentPct = mutual.length > 0 ? Math.round((aligned.length / mutual.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="bg-bg-surface border border-accent-gold/20 rounded-2xl p-6 text-center shadow-gold">
        <motion.p
          className="font-display text-6xl italic text-accent-gold mb-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
        >
          {aligned.length}
        </motion.p>
        <p className="text-text-secondary text-sm">
          of {mutual.length} shared answers match
        </p>

        {mutual.length > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-gold/60 to-accent-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${alignmentPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1.5 font-mono">{alignmentPct}% alignment</p>
          </div>
        )}

        <p className="text-text-tertiary text-xs mt-3">
          {alignmentPct >= 80
            ? 'You two are incredibly in sync 💫'
            : alignmentPct >= 60
              ? 'Great alignment — different in the best ways 🌿'
              : alignmentPct >= 40
                ? 'You complement each other beautifully ✨'
                : 'Your differences make you interesting 💛'}
        </p>
      </div>

      {/* Per-category breakdown */}
      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const catPrefs = mutual.filter((p) => p.category === cat);
          const catAligned = catPrefs.filter((p) => p.myChoice === p.partnerChoice);
          const pct = catPrefs.length ? Math.round((catAligned.length / catPrefs.length) * 100) : 0;

          return (
            <div key={cat} className="bg-bg-surface border border-border-subtle rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{categoryEmoji[cat]}</span>
                  <span className="text-sm text-text-secondary capitalize">{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-tertiary">
                    {catAligned.length}/{catPrefs.length}
                  </span>
                  <span className="font-mono text-xs text-text-tertiary">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-gold/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {mutual.length === 0 && (
        <p className="text-text-tertiary text-sm text-center py-4">
          Answer some questions to see your alignment ✨
        </p>
      )}
    </div>
  );
}
