import { z } from 'zod';

export const createTimelineEventSchema = z.object({
  date: z.string().datetime(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  emoji: z.string().min(1).max(10),
  order: z.number().int().min(0),
});

export const updateTimelineEventSchema = createTimelineEventSchema.partial();

export type CreateTimelineEventInput = z.infer<typeof createTimelineEventSchema>;
export type UpdateTimelineEventInput = z.infer<typeof updateTimelineEventSchema>;
