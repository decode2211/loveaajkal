import { z } from 'zod';

export const mediaTypeSchema = z.enum(['MOVIE', 'SHOW', 'ANIME', 'DOCUMENTARY']);

export const addWatchlistItemSchema = z.object({
  title: z.string().min(1).max(200),
  type: mediaTypeSchema,
  posterUrl: z.string().url().optional().or(z.literal('')),
  priority: z.number().int().min(0).default(0),
});

export const updateWatchlistItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: mediaTypeSchema.optional(),
  posterUrl: z.string().url().optional().or(z.literal('')),
  priority: z.number().int().min(0).optional(),
  watched: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reviewSchema = z.object({
  heartRating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type MediaType = z.infer<typeof mediaTypeSchema>;
export type AddWatchlistItemInput = z.infer<typeof addWatchlistItemSchema>;
export type UpdateWatchlistItemInput = z.infer<typeof updateWatchlistItemSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
