import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { env } from '../lib/env';
import { logAudit } from '../lib/audit';
import { asyncHandler } from '../lib/asyncHandler';

export const paymentRouter = Router();

const initiateSchema = z.object({
  entity: z.enum(['transcript', 'certificate']),
  entityId: z.string().uuid(),
});

// Step 1: student initiates payment for a request they own. We create a PENDING
// Payment row and hand back a srmTransId the frontend passes on to the gateway.
paymentRouter.post('/initiate', requireAuth, asyncHandler(async (req, res) => {
  const { entity, entityId } = initiateSchema.parse(req.body);

  const record =
    entity === 'transcript'
      ? await prisma.transcriptApplication.findUnique({ where: { id: entityId } })
      : await prisma.certificateRequest.findUnique({ where: { id: entityId } });

  if (!record) return res.status(404).json({ error: 'Request not found' });
  if (record.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' });
  if (record.paymentStatus === 'SUCCESS') return res.status(400).json({ error: 'Already paid' });

  const srmTransId = `HITS-${Date.now()}-${uuid().slice(0, 8).toUpperCase()}`;

  const payment = await prisma.payment.create({
    data: {
      srmTransId,
      studentId: req.auth!.userId,
      feeType: entity === 'transcript' ? 'TRANSCRIPT' : 'CERTIFICATE',
      amount: record.feeAmount,
      status: 'PENDING',
      ...(entity === 'transcript' ? { transcriptApplicationId: entityId } : { certificateRequestId: entityId }),
    },
  });

  res.status(201).json({ payment, gatewayRedirectParams: { srmTransId, amount: record.feeAmount } });
}));

const callbackSchema = z.object({
  srmTransId: z.string(),
  pgTransId: z.string(),
  status: z.enum(['SUCCESS', 'FAILED']),
  signature: z.string(),
});

function verifySignature(payload: Omit<z.infer<typeof callbackSchema>, 'signature'>, signature: string): boolean {
  if (!env.paymentGatewayCallbackSecret) return true; // dev fallback when no secret configured
  const expected = crypto
    .createHmac('sha256', env.paymentGatewayCallbackSecret)
    .update(`${payload.srmTransId}|${payload.pgTransId}|${payload.status}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ''));
}

// Step 2: the payment gateway calls this server-to-server webhook. This is the ONLY
// place a payment is marked SUCCESS/FAILED — the frontend result pages just poll status.
paymentRouter.post('/callback', asyncHandler(async (req, res) => {
  const body = callbackSchema.parse(req.body);
  const { signature, ...payload } = body;

  if (!verifySignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payment = await prisma.payment.findUnique({ where: { srmTransId: body.srmTransId } });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { pgTransId: body.pgTransId, status: body.status },
  });

  if (payment.transcriptApplicationId) {
    await prisma.transcriptApplication.update({
      where: { id: payment.transcriptApplicationId },
      data: {
        paymentStatus: body.status,
        status: body.status === 'SUCCESS' ? 'APPLIED' : 'PENDING',
      },
    });
  }
  if (payment.certificateRequestId) {
    await prisma.certificateRequest.update({
      where: { id: payment.certificateRequestId },
      data: { paymentStatus: body.status },
    });
  }

  await logAudit(payment.studentId, 'PAYMENT_CALLBACK', 'Payment', payment.id, body.status);
  res.json({ payment: updated });
}));

// Frontend result pages (Payment Success/Failed) poll this to render the outcome.
paymentRouter.get('/status/:srmTransId', requireAuth, asyncHandler(async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { srmTransId: req.params.srmTransId } });
  if (!payment) return res.status(404).json({ error: 'Not found' });
  if (payment.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' });
  res.json({ payment });
}));

paymentRouter.get('/history', requireAuth, asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { studentId: req.auth!.userId },
    orderBy: { dateTime: 'desc' },
  });
  res.json({ payments });
}));

// Dev-only stand-in for a real payment gateway redirect, so the flow is testable
// end-to-end before a real gateway is integrated. Never enabled in production.
if (env.nodeEnv !== 'production') {
  const mockCompleteSchema = z.object({ srmTransId: z.string(), succeed: z.boolean().default(true) });

  paymentRouter.post('/mock-complete', requireAuth, asyncHandler(async (req, res) => {
    const { srmTransId, succeed } = mockCompleteSchema.parse(req.body);
    const payment = await prisma.payment.findUnique({ where: { srmTransId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' });

    const status = succeed ? 'SUCCESS' : 'FAILED';
    const pgTransId = `MOCK-${Date.now()}`;

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status, pgTransId },
    });

    if (payment.transcriptApplicationId) {
      await prisma.transcriptApplication.update({
        where: { id: payment.transcriptApplicationId },
        data: { paymentStatus: status, status: status === 'SUCCESS' ? 'APPLIED' : 'PENDING' },
      });
    }
    if (payment.certificateRequestId) {
      await prisma.certificateRequest.update({
        where: { id: payment.certificateRequestId },
        data: { paymentStatus: status },
      });
    }

    res.json({ payment: updated });
  }));
}
