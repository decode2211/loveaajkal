import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getHomeConfig(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, displayName: true, city: true, timezone: true, avatarUrl: true },
    orderBy: { createdAt: 'asc' },
  });

  let countdown = await prisma.countdownConfig.findFirst();
  if (!countdown) {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    countdown = await prisma.countdownConfig.create({
      data: { id: 'default', targetDate: future, label: 'Next time I see you 🛫' },
    });
  }

  const [p1, p2] = users;

  res.json({
    person1: p1 ? { name: p1.displayName, city: p1.city, timezone: p1.timezone, avatarUrl: p1.avatarUrl } : null,
    person2: p2 ? { name: p2.displayName, city: p2.city, timezone: p2.timezone, avatarUrl: p2.avatarUrl } : null,
    countdown: { targetDate: countdown.targetDate, label: countdown.label },
  });
}

const updateCountdownSchema = z.object({
  targetDate: z.string().datetime(),
  label: z.string().min(1).max(100),
});

export async function updateCountdown(req: AuthRequest, res: Response) {
  const { targetDate, label } = updateCountdownSchema.parse(req.body);
  const countdown = await prisma.countdownConfig.upsert({
    where: { id: 'default' },
    update: { targetDate: new Date(targetDate), label },
    create: { id: 'default', targetDate: new Date(targetDate), label },
  });
  res.json(countdown);
}
