import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './lib/env';
import { ensureBucket } from './lib/storage';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { transcriptRouter } from './routes/transcript';
import { certificateRouter } from './routes/certificate';
import { paymentRouter } from './routes/payment';
import { adminRouter } from './routes/admin';
import { filesRouter } from './routes/files';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Behind the nginx reverse proxy container — trust exactly one hop so
// express-rate-limit resolves the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/transcripts', transcriptRouter);
app.use('/api/certificates', certificateRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/files', filesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await ensureBucket();
  app.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
