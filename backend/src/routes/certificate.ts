import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { logAudit } from '../lib/audit';
import { asyncHandler } from '../lib/asyncHandler';

export const certificateRouter = Router();
certificateRouter.use(requireAuth);

const DEFAULT_FEE = 150;

const createSchema = z.object({
  certificateType: z.string().min(2),
  purpose: z.string().min(2),
});

certificateRouter.post('/', asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const record = await prisma.certificateRequest.create({
    data: {
      studentId: req.auth!.userId,
      certificateType: data.certificateType,
      purpose: data.purpose,
      feeAmount: DEFAULT_FEE,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
  });
  await logAudit(req.auth!.userId, 'CREATE', 'CertificateRequest', record.id);
  res.status(201).json({ request: record });
}));

certificateRouter.get('/', asyncHandler(async (req, res) => {
  const requests = await prisma.certificateRequest.findMany({
    where: { studentId: req.auth!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ requests });
}));

certificateRouter.get('/:id', asyncHandler(async (req, res) => {
  const record = await prisma.certificateRequest.findUnique({ where: { id: req.params.id } });
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (record.studentId !== req.auth!.userId && req.auth!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ request: record });
}));

// Marks a ready certificate as downloaded (student pulled the file via the presigned URL).
certificateRouter.post('/:id/mark-downloaded', asyncHandler(async (req, res) => {
  const record = await prisma.certificateRequest.findUnique({ where: { id: req.params.id } });
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (record.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' });
  if (record.status !== 'GENERATED') return res.status(400).json({ error: 'Certificate is not ready' });

  const updated = await prisma.certificateRequest.update({
    where: { id: record.id },
    data: { status: 'DOWNLOADED' },
  });
  res.json({ request: updated });
}));
