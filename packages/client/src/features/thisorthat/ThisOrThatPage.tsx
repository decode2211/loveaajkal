import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BarChart2, List } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { thisOrThatQuestions } from '@us-always/shared';
import { PageTransition, itemVariants } from '../../components/layout/PageTransition';
import { PageSpinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { ChoiceCard } from './ChoiceCard';
import { AlignmentView } from './AlignmentView';

interface PreferenceData {
  id: number;
  optionA: string;
  optionB: string;
  emojiA: string;
  emojiB: string;
  category: string;
  myChoice: 0 | 1 | null;
  partnerChoice: 0 | 1 | null;
}

type TabType = 'questions' | 'alignment';

const categoryVariant = (cat: string): 'gold' | 'rose' | 'sage' | 'sky' => {
  const map: Record<string, 'gold' | 'rose' | 'sage' | 'sky'> = {
    lifestyle: 'gold',
    food: 'sage',
    travel: 'sky',
    romance: 'rose',
    entertainment: 'gold',
  };
  return map[cat] ?? 'gold';
};

export function ThisOrThatPage() {
  const qc = useQueryClient();
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<TabType>('questions');
  const [direction, setDirection] = useState(1);

  const { data: prefs, isLoading } = useQuery<PreferenceData[]>({
    queryKey: ['preferences'],
    queryFn: async () => {
      const { data } = await api.get<PreferenceData[]>('/preferences');
      return data;
    },
  });

  const answerMutation = useMutation({
    mutationFn: async ({ questionId, choice }: { questionId: number; choice: 0 | 1 }) => {
      await api.post(`/preferences/${questionId}`, { choice });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['preferences'] }),
    onError: () => toast.error('Failed to save answer'),
  });

  if (isLoading || !prefs) return <PageSpinner />;

  const current = prefs[index];
  const answered = prefs.filter((p) => p.myChoice !== null).length;

  const navigate = (dir: number) => {
    const next = index + dir;
    if (next < 0 || next >= prefs.length) return;
    setDirection(dir);
    setIndex(next);
  };

  const handleChoice = (choice: 0 | 1) => {
    if (answerMutation.isPending) return;
    answerMutation.mutate({ questionId: current.id, choice });
  };

  return (
    <PageTransition className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl italic text-text-primary">This or That 🎭</h1>
          <p className="text-text-tertiary text-sm mt-1">What do we choose?</p>
        </div>
        <div className="flex gap-1 bg-bg-surface border border-border-subtle rounded-xl p-1">
          <button
            onClick={() => setTab('questions')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'questions' ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-tertiary hover:text-text-secondary'
            }`}
            aria-label="Questions tab"
          >
            <List size={13} />
            <span className="hidden sm:inline">Questions</span>
          </button>
          <button
            onClick={() => setTab('alignment')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'alignment' ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-tertiary hover:text-text-secondary'
            }`}
            aria-label="Alignment tab"
          >
            <BarChart2 size={13} />
            <span className="hidden sm:inline">Alignment</span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'questions' ? (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-text-tertiary font-mono mb-1.5">
                <span>{answered}/{thisOrThatQuestions.length} answered</span>
                <span>{index + 1} / {prefs.length}</span>
              </div>
              <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-gold rounded-full transition-all duration-500"
                  style={{ width: `${(answered / thisOrThatQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Category badge */}
            <div className="mb-4 text-center">
              <Badge variant={categoryVariant(current.category)}>{current.category}</Badge>
            </div>

            {/* Choice cards */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 50 }}
                transition={{ duration: 0.28 }}
              >
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <ChoiceCard
                    emoji={current.emojiA}
                    label={current.optionA}
                    side="A"
                    isMyChoice={current.myChoice === 0}
                    isPartnerChoice={current.partnerChoice === 0}
                    bothChose={current.myChoice === 0 && current.partnerChoice === 0}
                    disabled={answerMutation.isPending}
                    onClick={() => handleChoice(0)}
                  />
                  <ChoiceCard
                    emoji={current.emojiB}
                    label={current.optionB}
                    side="B"
                    isMyChoice={current.myChoice === 1}
                    isPartnerChoice={current.partnerChoice === 1}
                    bothChose={current.myChoice === 1 && current.partnerChoice === 1}
                    disabled={answerMutation.isPending}
                    onClick={() => handleChoice(1)}
                  />
                </div>

                {/* Alignment feedback */}
                <AnimatePresence>
                  {current.myChoice !== null && current.partnerChoice !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`p-3 rounded-xl text-center text-sm border ${
                        current.myChoice === current.partnerChoice
                          ? 'bg-accent-gold/10 border-accent-gold/20 text-accent-gold'
                          : 'bg-bg-surface border-border-subtle text-text-secondary'
                      }`}
                    >
                      {current.myChoice === current.partnerChoice
                        ? '💫 You both chose this!'
                        : `🤝 They chose ${
                            current.partnerChoice === 0
                              ? `${current.emojiA} ${current.optionA}`
                              : `${current.emojiB} ${current.optionB}`
                          }`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => navigate(-1)}
                disabled={index === 0}
                className="flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                aria-label="Previous question"
              >
                <ChevronLeft size={18} /> Prev
              </button>

              {/* Dot indicators */}
              <div className="flex gap-1.5">
                {prefs.slice(Math.max(0, index - 3), Math.min(prefs.length, index + 4)).map((_, i) => {
                  const realIdx = Math.max(0, index - 3) + i;
                  return (
                    <button
                      key={realIdx}
                      onClick={() => { setDirection(realIdx > index ? 1 : -1); setIndex(realIdx); }}
                      className={`rounded-full transition-all ${
                        realIdx === index
                          ? 'w-4 h-2 bg-accent-gold'
                          : 'w-2 h-2 bg-border-default hover:bg-border-strong'
                      }`}
                      aria-label={`Go to question ${realIdx + 1}`}
                    />
                  );
                })}
              </div>

              <button
                onClick={() => navigate(1)}
                disabled={index === prefs.length - 1}
                className="flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                aria-label="Next question"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="alignment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AlignmentView preferences={prefs} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
