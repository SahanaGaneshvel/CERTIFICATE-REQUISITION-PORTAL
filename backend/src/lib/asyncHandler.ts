import { NextFunction, Request, RequestHandler, Response } from 'express';

// Express does not forward rejections from async route handlers to error
// middleware — an unhandled rejection instead crashes the whole process
// (which is why every request 502s until the container restarts). Wrapping
// every handler here routes thrown/rejected errors to errorHandler.ts instead.
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
