import { z } from 'zod';

export const tripCategorySchema = z.enum(['FLIGHT', 'LOCATION', 'AGENDA', 'PACKING']);

export const createTripItemSchema = z.object({
  category: tripCategorySchema,
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  date: z.string().datetime().optional(),
  order: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional(),
});

export const updateTripItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  date: z.string().datetime().optional().nullable(),
  completed: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type TripCategory = z.infer<typeof tripCategorySchema>;
export type CreateTripItemInput = z.infer<typeof createTripItemSchema>;
export type UpdateTripItemInput = z.infer<typeof updateTripItemSchema>;
