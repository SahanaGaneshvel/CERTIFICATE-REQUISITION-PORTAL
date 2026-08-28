import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../lib/asyncHandler';

export const profileRouter = Router();
profileRouter.use(requireAuth);

// Optional email fields arrive as "" from the frontend when left blank, not undefined —
// treat blank as not-provided rather than rejecting it as an invalid email.
const optionalEmail = z
  .string()
  .email()
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined));

const registrationSchema = z.object({
  mobile: z.string().min(10).max(15),
  altMobile: z.string().max(15).optional(),
  email: z.string().email(),
  altEmail: optionalEmail,
});

profileRouter.post('/complete-registration', asyncHandler(async (req, res) => {
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
}));

const updateProfileSchema = z.object({
  mobile: z.string().min(10).max(15).optional(),
  altMobile: z.string().max(15).optional(),
  email: z.string().email().optional(),
  altEmail: optionalEmail,
});

profileRouter.patch('/', asyncHandler(async (req, res) => {
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
}));
