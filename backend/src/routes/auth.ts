import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

const loginSchema = z.object({
  registerNo: z.string().min(3),
  dateOfBirth: z.string().min(4),
});

function signToken(user: { id: string; role: 'STUDENT' | 'ADMIN'; registerNo: string }) {
  return jwt.sign(
    { userId: user.id, role: user.role, registerNo: user.registerNo },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
}

// Students authenticate with register number + date of birth (matches the college record).
// The "password" for a student account is the DOB, hashed at record-creation time by admin import.
authRouter.post('/login', loginLimiter, async (req, res) => {
  const { registerNo, dateOfBirth } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { registerNo } });
  if (!user) return res.status(401).json({ error: 'Invalid register number or date of birth' });

  const valid = await bcrypt.compare(dateOfBirth, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid register number or date of birth' });

  const token = signToken(user);
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

const adminLoginSchema = z.object({
  registerNo: z.string().min(3),
  password: z.string().min(6),
});

authRouter.post('/admin/login', loginLimiter, async (req, res) => {
  const { registerNo, password } = adminLoginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { registerNo } });
  if (!user || user.role !== 'ADMIN') return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ user: safeUser });
});
