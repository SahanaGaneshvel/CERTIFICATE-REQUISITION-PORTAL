import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { getDownloadUrl } from '../lib/storage';

export const filesRouter = Router();
filesRouter.use(requireAuth);

const KEY_FIELDS_TRANSCRIPT = [
  'applicantIdProofKey',
  'markSheetKey',
  'authorizedIdProofKey',
  'authorizationLetterKey',
  'generatedCertificateKey',
] as const;

const querySchema = z.object({
  entity: z.enum(['transcript', 'certificate']),
  id: z.string().uuid(),
  field: z.string(),
});

// Issues a short-lived presigned URL for a stored file, after checking the requester
// owns the record (or is an admin). Files are never served directly through this API.
filesRouter.get('/', async (req, res) => {
  const { entity, id, field } = querySchema.parse(req.query);
  const isAdmin = req.auth!.role === 'ADMIN';

  if (entity === 'transcript') {
    if (!(KEY_FIELDS_TRANSCRIPT as readonly string[]).includes(field)) {
      return res.status(400).json({ error: 'Invalid field' });
    }
    const record = await prisma.transcriptApplication.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: 'Not found' });
    if (!isAdmin && record.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' });
    const key = (record as unknown as Record<string, string | null>)[field];
    if (!key) return res.status(404).json({ error: 'File not set' });
    const url = await getDownloadUrl(key);
    return res.json({ url });
  }

  if (field !== 'generatedCertificateKey') {
    return res.status(400).json({ error: 'Invalid field' });
  }
  const record = await prisma.certificateRequest.findUnique({ where: { id } });
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (!isAdmin && record.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' });
  if (!record.generatedCertificateKey) return res.status(404).json({ error: 'File not set' });
  const url = await getDownloadUrl(record.generatedCertificateKey);
  res.json({ url });
});
