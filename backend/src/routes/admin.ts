import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadBuffer } from '../lib/storage';
import { logAudit } from '../lib/audit';
import { asyncHandler } from '../lib/asyncHandler';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/transcripts', asyncHandler(async (req, res) => {
  const status = z.string().optional().parse(req.query.status);
  const applications = await prisma.transcriptApplication.findMany({
    where: status ? { status: status as never } : undefined,
    include: { student: { select: { name: true, registerNo: true, email: true, mobileNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ applications });
}));

const transcriptStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPLIED', 'PROCESSING', 'READY', 'COLLECTED', 'REJECTED']),
  reviewNote: z.string().optional(),
});

adminRouter.patch('/transcripts/:id/status', asyncHandler(async (req, res) => {
  const data = transcriptStatusSchema.parse(req.body);
  const updated = await prisma.transcriptApplication.update({
    where: { id: req.params.id },
    data: { status: data.status, reviewNote: data.reviewNote, reviewedBy: req.auth!.userId },
  });
  await logAudit(req.auth!.userId, 'STATUS_UPDATE', 'TranscriptApplication', updated.id, data.status);
  res.json({ application: updated });
}));

adminRouter.post('/transcripts/:id/upload-certificate', upload.single('certificate'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'certificate file is required' });
  const key = await uploadBuffer('generated/transcripts', req.file.originalname, req.file.buffer, req.file.mimetype);
  const updated = await prisma.transcriptApplication.update({
    where: { id: req.params.id },
    data: { generatedCertificateKey: key, status: 'READY' },
  });
  await logAudit(req.auth!.userId, 'UPLOAD_CERTIFICATE', 'TranscriptApplication', updated.id);
  res.json({ application: updated });
}));

adminRouter.get('/certificate-requests', asyncHandler(async (req, res) => {
  const status = z.string().optional().parse(req.query.status);
  const requests = await prisma.certificateRequest.findMany({
    where: status ? { status: status as never } : undefined,
    include: { student: { select: { name: true, registerNo: true, email: true, mobileNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ requests });
}));

const certStatusSchema = z.object({
  status: z.enum(['PENDING', 'GENERATED', 'DOWNLOADED', 'REJECTED']),
  reviewNote: z.string().optional(),
});

adminRouter.patch('/certificate-requests/:id/status', asyncHandler(async (req, res) => {
  const data = certStatusSchema.parse(req.body);
  const updated = await prisma.certificateRequest.update({
    where: { id: req.params.id },
    data: { status: data.status, reviewNote: data.reviewNote, reviewedBy: req.auth!.userId },
  });
  await logAudit(req.auth!.userId, 'STATUS_UPDATE', 'CertificateRequest', updated.id, data.status);
  res.json({ request: updated });
}));

adminRouter.post('/certificate-requests/:id/upload-certificate', upload.single('certificate'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'certificate file is required' });
  const key = await uploadBuffer('generated/certificates', req.file.originalname, req.file.buffer, req.file.mimetype);
  const updated = await prisma.certificateRequest.update({
    where: { id: req.params.id },
    data: { generatedCertificateKey: key, status: 'GENERATED' },
  });
  await logAudit(req.auth!.userId, 'UPLOAD_CERTIFICATE', 'CertificateRequest', updated.id);
  res.json({ request: updated });
}));

const createStudentSchema = z.object({
  registerNo: z.string().min(3),
  dateOfBirth: z.string().min(4),
  name: z.string().min(1),
  degree: z.string().min(1),
  branch: z.string().min(1),
  campus: z.string().min(1),
  gender: z.string().min(1),
  admittedYear: z.coerce.number().int(),
  institution: z.string().min(1),
});

// Admin office imports/creates student records; DOB (hashed) acts as the student's login secret.
adminRouter.post('/students', asyncHandler(async (req, res) => {
  const data = createStudentSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.dateOfBirth, 10);
  const student = await prisma.user.create({
    data: { ...data, passwordHash, role: 'STUDENT' },
  });
  const { passwordHash: _ph, ...safeUser } = student;
  res.status(201).json({ student: safeUser });
}));
