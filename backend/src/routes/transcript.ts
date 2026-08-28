import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadBuffer } from '../lib/storage';
import { logAudit } from '../lib/audit';
import { asyncHandler } from '../lib/asyncHandler';

export const transcriptRouter = Router();
transcriptRouter.use(requireAuth);

const FEE_PER_ENVELOPE = 200;

const createSchema = z.object({
  numberOfSets: z.coerce.number().int().min(1).max(20),
  notSealed: z.coerce.number().int().min(0),
  sealed: z.coerce.number().int().min(0),
  collectionMode: z.enum(['APPLICANT_IN_PERSON', 'APPLICANT_BY_POST', 'AUTHORIZED_IN_PERSON', 'AUTHORIZED_BY_POST']),
  authorizedName: z.string().optional(),
  authorizedRelationship: z.string().optional(),
  authorizedAddress: z.string().optional(),
  authorizedMobile: z.string().optional(),
});

const uploadFields = upload.fields([
  { name: 'applicantIdProof', maxCount: 1 },
  { name: 'markSheet', maxCount: 1 },
  { name: 'authorizedIdProof', maxCount: 1 },
  { name: 'authorizationLetter', maxCount: 1 },
]);

transcriptRouter.post('/', uploadFields, asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const totalEnvelopes = data.notSealed + data.sealed;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  const isAuthorized = data.collectionMode.startsWith('AUTHORIZED');
  if (isAuthorized && (!data.authorizedName || !data.authorizedMobile)) {
    return res.status(400).json({ error: 'Authorized person details are required for this collection mode' });
  }

  async function storeFile(field: string): Promise<string | undefined> {
    const file = files?.[field]?.[0];
    if (!file) return undefined;
    return uploadBuffer(`transcripts/${req.auth!.userId}`, file.originalname, file.buffer, file.mimetype);
  }

  const [applicantIdProofKey, markSheetKey, authorizedIdProofKey, authorizationLetterKey] = await Promise.all([
    storeFile('applicantIdProof'),
    storeFile('markSheet'),
    storeFile('authorizedIdProof'),
    storeFile('authorizationLetter'),
  ]);

  const record = await prisma.transcriptApplication.create({
    data: {
      referenceNumber: `TRX-${Date.now()}-${uuid().slice(0, 6).toUpperCase()}`,
      studentId: req.auth!.userId,
      numberOfSets: data.numberOfSets,
      notSealed: data.notSealed,
      sealed: data.sealed,
      totalEnvelopes,
      collectionMode: data.collectionMode,
      authorizedName: data.authorizedName,
      authorizedRelationship: data.authorizedRelationship,
      authorizedAddress: data.authorizedAddress,
      authorizedMobile: data.authorizedMobile,
      applicantIdProofKey,
      markSheetKey,
      authorizedIdProofKey,
      authorizationLetterKey,
      feeAmount: totalEnvelopes * FEE_PER_ENVELOPE,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
  });

  await logAudit(req.auth!.userId, 'CREATE', 'TranscriptApplication', record.id);
  res.status(201).json({ application: record });
}));

transcriptRouter.get('/', asyncHandler(async (req, res) => {
  const applications = await prisma.transcriptApplication.findMany({
    where: { studentId: req.auth!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ applications });
}));

transcriptRouter.get('/:id', asyncHandler(async (req, res) => {
  const record = await prisma.transcriptApplication.findUnique({ where: { id: req.params.id } });
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (record.studentId !== req.auth!.userId && req.auth!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ application: record });
}));
