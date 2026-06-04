import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createTripItemSchema, updateTripItemSchema } from '@us-always/shared';

const INCLUDE = { addedBy: { select: { id: true, displayName: true } } };

export async function getTrip(_req: AuthRequest, res: Response) {
  const items = await prisma.tripItem.findMany({
    include: INCLUDE,
    orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
  });

  res.json({
    FLIGHT: items.filter((i) => i.category === 'FLIGHT'),
    LOCATION: items.filter((i) => i.category === 'LOCATION'),
    AGENDA: items.filter((i) => i.category === 'AGENDA'),
    PACKING: items.filter((i) => i.category === 'PACKING'),
  });
}

export async function addTripItem(req: AuthRequest, res: Response) {
  const data = createTripItemSchema.parse(req.body);
  const item = await prisma.tripItem.create({
    data: {
      ...data,
      date: data.date ? new Date(data.date) : null,
      metadata: data.metadata ? (data.metadata as object) : undefined,
      addedById: req.userId!,
    },
    include: INCLUDE,
  });
  res.status(201).json(item);
}

export async function updateTripItem(req: AuthRequest, res: Response) {
  const data = updateTripItemSchema.parse(req.body);
  const item = await prisma.tripItem.update({
    where: { id: req.params.id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : data.date === null ? null : undefined,
      metadata: data.metadata ? (data.metadata as object) : undefined,
    },
    include: INCLUDE,
  });
  res.json(item);
}

export async function deleteTripItem(req: AuthRequest, res: Response) {
  await prisma.tripItem.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
}
