import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizResultProps {
  options: string[];
  yourAnswer: number;
  correctIndex: number;
}

export function QuizResult({ options, yourAnswer, correctIndex }: QuizResultProps) {
  const isCorrect = yourAnswer === correctIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Result banner */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className={`rounded-xl p-4 text-center border ${
          isCorrect
            ? 'border-accent-sage/40 bg-accent-sage/10'
            : 'border-accent-rose/40 bg-accent-rose/10'
        }`}
      >
        {isCorrect ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 size={18} className="text-accent-sage" />
            <span className="text-accent-sage font-medium text-sm">You got it right! 🎯</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <XCircle size={18} className="text-accent-rose" />
            <span className="text-accent-rose font-medium text-sm">Not quite — correct answer below 💛</span>
          </div>
        )}
      </motion.div>

      {/* Options with result coloring */}
      {options.map((opt, i) => {
        const isChosen = yourAnswer === i;
        const isRight = correctIndex === i;

        let borderColor = 'border-border-subtle text-text-tertiary';
        let Icon: React.ElementType | null = null;

        if (isRight) {
          borderColor = 'border-accent-sage bg-accent-sage/10 text-accent-sage';
          Icon = CheckCircle2;
        } else if (isChosen && !isRight) {
          borderColor = 'border-accent-rose bg-accent-rose/10 text-accent-rose line-through opacity-70';
          Icon = XCircle;
        }

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-xl border p-3 flex items-center gap-3 text-sm ${borderColor}`}
          >
            <span className="font-mono text-xs w-5 flex-shrink-0 opacity-60">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1">{opt}</span>
            {Icon && <Icon size={16} className="flex-shrink-0" />}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
