import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createTimelineEventSchema, updateTimelineEventSchema } from '@us-always/shared';

export async function getTimeline(_req: AuthRequest, res: Response) {
  const events = await prisma.timelineEvent.findMany({
    include: { photos: true },
    orderBy: { order: 'asc' },
  });
  res.json(events);
}

export async function createEvent(req: AuthRequest, res: Response) {
  const data = createTimelineEventSchema.parse(req.body);
  const event = await prisma.timelineEvent.create({
    data: { ...data, date: new Date(data.date) },
    include: { photos: true },
  });
  res.status(201).json(event);
}

export async function updateEvent(req: AuthRequest, res: Response) {
  const data = updateTimelineEventSchema.parse(req.body);
  const event = await prisma.timelineEvent.update({
    where: { id: req.params.id },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
    include: { photos: true },
  });
  res.json(event);
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  await prisma.timelineEvent.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
}

export async function uploadPhotos(req: AuthRequest, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ message: 'No files uploaded' });
    return;
  }

  const photos = await Promise.all(
    files.map((file) => {
      const f = file as Express.Multer.File & { path: string; filename: string };
      return prisma.photo.create({
        data: { timelineEventId: req.params.id, cloudinaryId: f.filename, url: f.path, caption: null },
      });
    }),
  );

  res.status(201).json(photos);
}

export async function deletePhoto(req: AuthRequest, res: Response) {
  await prisma.photo.delete({ where: { id: req.params.photoId } });
  res.json({ message: 'Photo deleted' });
}
