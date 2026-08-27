import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

export const profileRouter = Router();
profileRouter.use(requireAuth);

const registrationSchema = z.object({
  mobile: z.string().min(10).max(15),
  altMobile: z.string().max(15).optional(),
  email: z.string().email(),
  altEmail: z.string().email().optional(),
});

profileRouter.post('/complete-registration', async (req, res) => {
  const data = registrationSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.auth!.userId },
    data: {
      mobileNumber: data.mobile,
      alternateMobile: data.altMobile,
      email: data.email,
      alternateEmail: data.altEmail,
      isRegistered: true,
    },
  });
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ user: safeUser });
});

const updateProfileSchema = z.object({
  mobile: z.string().min(10).max(15).optional(),
  altMobile: z.string().max(15).optional(),
  email: z.string().email().optional(),
  altEmail: z.string().email().optional(),
});

profileRouter.patch('/', async (req, res) => {
  const data = updateProfileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.auth!.userId },
    data: {
      ...(data.mobile !== undefined && { mobileNumber: data.mobile }),
      ...(data.altMobile !== undefined && { alternateMobile: data.altMobile }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.altEmail !== undefined && { alternateEmail: data.altEmail }),
    },
  });
  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ user: safeUser });
});
