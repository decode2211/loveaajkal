import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { loginSchema } from '@us-always/shared';
import { AuthRequest } from '../middleware/auth.middleware';

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

export async function login(req: Request, res: Response) {
  const { username, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  const { accessToken, refreshToken } = generateTokens(user.id);
  const { passwordHash: _, ...safeUser } = user;
  // Return tokens in body — no cookies needed
  res.json({ user: safeUser, accessToken, refreshToken });
}

export async function refresh(req: Request, res: Response) {
  // Accept refresh token from body or Authorization header
  const token = req.body?.refreshToken || req.headers['x-refresh-token'];
  if (!token) { res.status(401).json({ message: 'No refresh token' }); return; }
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) { res.status(401).json({ message: 'User not found' }); return; }
    const { accessToken, refreshToken } = generateTokens(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
}

export function logout(_req: Request, res: Response) {
  // Client just drops the tokens — nothing to do server-side
  res.json({ message: 'Logged out' });
}