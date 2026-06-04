import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useDailyQuiz } from '../../hooks/useDailyQuiz';
import { PageTransition, itemVariants } from '../../components/layout/PageTransition';
import { PageSpinner } from '../../components/ui/Spinner';
import { QuizCard } from './QuizCard';
import { QuizResult } from './QuizResult';
import api from '../../lib/api';

interface HistoryItem {
  myAnswers: Array<{ questionId: number; selectedOption: number; dateKey: string; answeredAt: string }>;
  partnerAnswers: Array<{ questionId: number; selectedOption: number; dateKey: string }>;
}

export function QuizPage() {
  const { todayQuery, answerMutation } = useDailyQuiz();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resultData, setResultData] = useState<{ correctIndex: number; yourAnswer: number } | null>(null);

  const historyQuery = useQuery<HistoryItem>({
    queryKey: ['quiz', 'history'],
    queryFn: async () => {
      const { data } = await api.get<HistoryItem>('/quiz/history');
      return data;
    },
  });

  const handleSelect = async (idx: number) => {
    if (resultData || todayQuery.data?.alreadyAnswered || answerMutation.isPending) return;
    setSelectedOption(idx);

    try {
      const result = await answerMutation.mutateAsync({
        questionId: todayQuery.data!.questionId,
        selectedOption: idx,
      });
      setResultData({ correctIndex: result.correctIndex, yourAnswer: result.yourAnswer });
      if (result.correct) toast.success('Correct! 🎉');
      else toast.error("Not quite, but you'll get it next time 💛");
    } catch {
      setSelectedOption(null);
    }
  };

  if (todayQuery.isLoading) return <PageSpinner />;

  const { question, alreadyAnswered, yourAnswer, correctIndex } = todayQuery.data ?? {};

  const streak = historyQuery.data?.myAnswers.length ?? 0;

  // Determine what to show
  const isRevealed = !!resultData;
  const isDone = alreadyAnswered || isRevealed;

  const shownAnswer = isRevealed ? resultData!.yourAnswer : (alreadyAnswered ? yourAnswer ?? null : null);
  const shownCorrect = isRevealed ? resultData!.correctIndex : (alreadyAnswered ? correctIndex ?? null : null);

  return (
    <PageTransition className="p-6 max-w-xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic text-text-primary">Daily Spark ✨</h1>
          <p className="text-text-tertiary text-sm mt-1">One question, every day</p>
        </div>
        <div className="flex items-center gap-1.5 bg-bg-surface border border-border-subtle rounded-xl px-3 py-2">
          <Flame size={14} className="text-accent-gold" />
          <span className="font-mono text-sm text-text-secondary">{streak}</span>
          <span className="text-xs text-text-tertiary">days</span>
        </div>
      </motion.div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {isDone ? (
            /* ── Already answered / revealed ─────────────────────── */
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              {/* Question recap */}
              <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 mb-4">
                <p className="font-display text-xl italic text-text-primary leading-snug mb-4">
                  {question?.question}
                </p>
                {shownAnswer !== null && shownCorrect !== null && question && (
                  <QuizResult
                    options={question.options}
                    yourAnswer={shownAnswer}
                    correctIndex={shownCorrect}
                  />
                )}
              </div>

              {/* Come back tomorrow */}
              {!isRevealed && (
                <div className="flex flex-col items-center gap-2 mt-6">
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Clock size={30} className="text-text-tertiary" />
                  </motion.div>
                  <p className="text-text-tertiary text-sm">Come back tomorrow for a new question</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* ── Active question ────────────────────────────────── */
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {question && (
                <QuizCard
                  question={question.question}
                  category={question.category}
                  options={question.options}
                  selectedOption={selectedOption}
                  isPending={answerMutation.isPending}
                  onSelect={handleSelect}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
