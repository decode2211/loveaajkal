import { z } from 'zod';

export const submitAnswerSchema = z.object({
  questionId: z.number().int().min(0),
  selectedOption: z.number().int().min(0).max(3),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
