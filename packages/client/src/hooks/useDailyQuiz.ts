import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface TodayQuizResponse {
  question: { id: number; question: string; options: string[]; category: string };
  questionId: number;
  alreadyAnswered: boolean;
  yourAnswer: number | null;
  correctIndex: number | null;
  dateKey: string;
}

interface AnswerResponse {
  correct: boolean;
  correctIndex: number;
  yourAnswer: number;
}

export function useDailyQuiz() {
  const qc = useQueryClient();

  const todayQuery = useQuery<TodayQuizResponse>({
    queryKey: ['quiz', 'today'],
    queryFn: async () => {
      const { data } = await api.get<TodayQuizResponse>('/quiz/today');
      return data;
    },
  });

  const answerMutation = useMutation<AnswerResponse, Error, { questionId: number; selectedOption: number }>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AnswerResponse>('/quiz/answer', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quiz', 'today'] });
    },
    onError: (err) => {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to submit answer');
    },
  });

  return { todayQuery, answerMutation };
}
