import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { thisOrThatQuestions } from '@us-always/shared';

export async function getPreferences(req: AuthRequest, res: Response) {
  const myPreferences = await prisma.preference.findMany({ where: { userId: req.userId! } });

  const allUsers = await prisma.user.findMany({
    select: { id: true }, orderBy: { createdAt: 'asc' },
  });
  const partnerId = allUsers.find((u) => u.id !== req.userId!)?.id;
  const partnerPreferences = partnerId
    ? await prisma.preference.findMany({ where: { userId: partnerId } })
    : [];

  const result = thisOrThatQuestions.map((q) => ({
    ...q,
    myChoice: myPreferences.find((p) => p.questionId === q.id)?.choice ?? null,
    partnerChoice: partnerPreferences.find((p) => p.questionId === q.id)?.choice ?? null,
  }));

  res.json(result);
}

export async function setPreference(req: AuthRequest, res: Response) {
  const questionId = parseInt(req.params.questionId, 10);
  const { choice } = z.object({ choice: z.union([z.literal(0), z.literal(1)]) }).parse(req.body);

  const pref = await prisma.preference.upsert({
    where: { userId_questionId: { userId: req.userId!, questionId } },
    update: { choice },
    create: { userId: req.userId!, questionId, choice },
  });

  res.json(pref);
}

export async function logMissMeter(req: AuthRequest, res: Response) {
  const { level, note } = z.object({
    level: z.number().int().min(0).max(100).transform(Math.round),
    note: z.string().max(500).optional(),
  }).parse(req.body);

  const log = await prisma.missMeterLog.create({
    data: { userId: req.userId!, level, note },
    include: { user: { select: { id: true, displayName: true } } },
  });
  res.status(201).json(log);
}

export async function getLatestMissMeters(_req: AuthRequest, res: Response) {
  const allUsers = await prisma.user.findMany({
    select: { id: true, displayName: true }, orderBy: { createdAt: 'asc' },
  });

  const logs = await Promise.all(
    allUsers.map(async (user) => {
      const latest = await prisma.missMeterLog.findFirst({
        where: { userId: user.id },
        orderBy: { loggedAt: 'desc' },
        include: { user: { select: { id: true, displayName: true } } },
      });
      return { user, latest };
    }),
  );

  res.json(logs);
}

export async function getMissMeterHistory(_req: AuthRequest, res: Response) {
  const allUsers = await prisma.user.findMany({
    select: { id: true, displayName: true }, orderBy: { createdAt: 'asc' },
  });

  const history = await Promise.all(
    allUsers.map(async (user) => {
      const logs = await prisma.missMeterLog.findMany({
        where: { userId: user.id },
        orderBy: { loggedAt: 'asc' },
        take: 30,
      });
      return { user, logs };
    }),
  );

  res.json(history);
}
