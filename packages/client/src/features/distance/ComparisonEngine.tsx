import { motion } from 'framer-motion';
import { distanceComparisons, Comparison } from '@us-always/shared';
import { containerVariants, itemVariants } from '../../components/layout/PageTransition';

interface ComparisonEngineProps {
  distanceKm: number;
  activeId: string | null;
  onSelect: (id: string) => void;
}

function ComparisonCard({
  comp,
  distanceKm,
  isActive,
  onClick,
}: {
  comp: Comparison;
  distanceKm: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const value = comp.calculate(distanceKm);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        rounded-2xl border p-4 cursor-pointer transition-all duration-200
        ${isActive
          ? 'border-accent-gold/40 bg-bg-hover shadow-gold'
          : 'border-border-subtle bg-bg-surface hover:border-border-default'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{comp.emoji}</span>
        <div className="min-w-0">
          <p className="font-mono text-xl text-text-primary leading-tight">{value}</p>
          <p className="text-text-secondary text-xs mt-0.5">{comp.unit}</p>
          <p className="text-text-tertiary text-xs mt-2 italic leading-relaxed">{comp.wittyLine}</p>
        </div>
      </div>
      {isActive && (
        <motion.div
          className="mt-3 pt-2 border-t border-accent-gold/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xs text-accent-gold font-mono">{comp.label}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export function ComparisonEngine({ distanceKm, activeId, onSelect }: ComparisonEngineProps) {
  return (
    <div>
      <h2 className="font-display text-xl italic text-text-secondary mb-4">
        In perspective...
      </h2>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {distanceComparisons.map((comp) => (
          <ComparisonCard
            key={comp.id}
            comp={comp}
            distanceKm={distanceKm}
            isActive={activeId === comp.id}
            onClick={() => onSelect(comp.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}
