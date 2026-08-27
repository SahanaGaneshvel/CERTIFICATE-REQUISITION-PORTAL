import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
  }
  if (err instanceof Error) {
    console.error(err);
    const status = (err as Error & { status?: number }).status ?? 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
