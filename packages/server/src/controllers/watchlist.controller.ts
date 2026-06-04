import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { addWatchlistItemSchema, updateWatchlistItemSchema, reviewSchema } from '@us-always/shared';

const INCLUDE = {
  addedBy: { select: { id: true, displayName: true } },
  reviews: { include: { user: { select: { id: true, displayName: true } } } },
};

export async function getWatchlist(_req: AuthRequest, res: Response) {
  const items = await prisma.watchlistItem.findMany({
    include: INCLUDE,
    orderBy: [{ watched: 'asc' }, { priority: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });
  res.json(items);
}

export async function addItem(req: AuthRequest, res: Response) {
  const data = addWatchlistItemSchema.parse(req.body);
  const item = await prisma.watchlistItem.create({
    data: { ...data, addedById: req.userId!, posterUrl: data.posterUrl || null },
    include: INCLUDE,
  });
  res.status(201).json(item);
}

export async function updateItem(req: AuthRequest, res: Response) {
  const data = updateWatchlistItemSchema.parse(req.body);
  const updateData: Record<string, unknown> = { ...data };
  if (data.watched === true) updateData.watchedAt = new Date();
  if (data.posterUrl === '') updateData.posterUrl = null;

  const item = await prisma.watchlistItem.update({
    where: { id: req.params.id },
    data: updateData,
    include: INCLUDE,
  });
  res.json(item);
}

export async function deleteItem(_req: AuthRequest, res: Response) {
  await prisma.watchlistItem.delete({ where: { id: _req.params.id } });
  res.json({ message: 'Deleted' });
}

export async function submitReview(req: AuthRequest, res: Response) {
  const data = reviewSchema.parse(req.body);
  const review = await prisma.review.upsert({
    where: { watchlistItemId_userId: { watchlistItemId: req.params.id, userId: req.userId! } },
    update: data,
    create: { ...data, watchlistItemId: req.params.id, userId: req.userId! },
    include: { user: { select: { id: true, displayName: true } } },
  });
  res.json(review);
}

export async function getReviews(req: AuthRequest, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { watchlistItemId: req.params.id },
    include: { user: { select: { id: true, displayName: true } } },
  });
  res.json(reviews);
}
