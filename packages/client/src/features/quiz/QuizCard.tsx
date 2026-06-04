import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';

interface QuizCardProps {
  question: string;
  category: string;
  options: string[];
  selectedOption: number | null;
  isPending: boolean;
  onSelect: (index: number) => void;
}

const categoryVariant = (cat: string): 'gold' | 'rose' | 'sage' | 'sky' => {
  const map: Record<string, 'gold' | 'rose' | 'sage' | 'sky'> = {
    'about-me': 'gold',
    'about-you': 'rose',
    us: 'rose',
    fun: 'sage',
  };
  return map[cat] ?? 'gold';
};

export function QuizCard({ question, category, options, selectedOption, isPending, onSelect }: QuizCardProps) {
  return (
    <div>
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 mb-6">
        <div className="mb-3">
          <Badge variant={categoryVariant(category)}>{category.replace('-', ' ')}</Badge>
        </div>
        <h2 className="font-display text-2xl md:text-3xl italic text-text-primary leading-snug">
          {question}
        </h2>
      </div>

      <div className="space-y-3">
        {options.map((opt, i) => {
          const isSelected = selectedOption === i;
          return (
            <motion.button
              key={i}
              onClick={() => onSelect(i)}
              disabled={isPending || selectedOption !== null}
              whileHover={{ scale: isPending || selectedOption !== null ? 1 : 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full text-left rounded-xl border p-4 transition-all duration-200 text-sm
                ${isSelected
                  ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                  : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-accent-gold/50 hover:text-text-primary'
                }
                disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-tertiary w-5 flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
