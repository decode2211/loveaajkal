import { Response } from 'express';
import { format } from 'date-fns';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { submitAnswerSchema } from '@us-always/shared';
import { quizQuestions } from '@us-always/shared';

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getTodayQuestion(req: AuthRequest, res: Response) {
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const question = quizQuestions[dayOfYear % quizQuestions.length];
  const dateKey = format(today, 'yyyy-MM-dd');

  const existingAnswer = await prisma.quizAnswer.findUnique({
    where: { userId_dateKey: { userId: req.userId!, dateKey } },
  });

  const { correctIndex: _, ...safeQuestion } = question;

  res.json({
    question: safeQuestion,
    questionId: question.id,
    alreadyAnswered: !!existingAnswer,
    yourAnswer: existingAnswer?.selectedOption ?? null,
    correctIndex: existingAnswer ? question.correctIndex : null,
    dateKey,
  });
}

export async function submitAnswer(req: AuthRequest, res: Response) {
  const { questionId, selectedOption } = submitAnswerSchema.parse(req.body);
  const dateKey = format(new Date(), 'yyyy-MM-dd');

  const existing = await prisma.quizAnswer.findUnique({
    where: { userId_dateKey: { userId: req.userId!, dateKey } },
  });

  if (existing) {
    res.status(409).json({ message: 'Already answered today' });
    return;
  }

  const question = quizQuestions.find((q) => q.id === questionId);
  if (!question) {
    res.status(404).json({ message: 'Question not found' });
    return;
  }

  await prisma.quizAnswer.create({
    data: { userId: req.userId!, questionId, selectedOption, dateKey },
  });

  res.json({
    correct: selectedOption === question.correctIndex,
    correctIndex: question.correctIndex,
    yourAnswer: selectedOption,
  });
}

export async function getHistory(req: AuthRequest, res: Response) {
  const myAnswers = await prisma.quizAnswer.findMany({
    where: { userId: req.userId! },
    orderBy: { answeredAt: 'desc' },
    take: 30,
    include: { user: { select: { id: true, displayName: true, username: true } } },
  });

  const allUsers = await prisma.user.findMany({
    select: { id: true, displayName: true },
    orderBy: { createdAt: 'asc' },
  });
  const partnerId = allUsers.find((u) => u.id !== req.userId!)?.id;

  const partnerAnswers = partnerId
    ? await prisma.quizAnswer.findMany({
        where: { userId: partnerId },
        orderBy: { answeredAt: 'desc' },
        take: 30,
        include: { user: { select: { id: true, displayName: true, username: true } } },
      })
    : [];

  res.json({ myAnswers, partnerAnswers });
}
