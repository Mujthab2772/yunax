import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';
import { logger } from '../logging/logger';

export function ErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err && err.statusCode && err.message) {
    // Fallback for the legacy ApiError
    statusCode = err.statusCode;
    message = err.message;
  } else if (err && err.name === 'ZodError') {
    statusCode = 400;
    try {
      const parsed = JSON.parse(err.message);
      message = Array.isArray(parsed) ? parsed.map((e: any) => e.message).join(', ') : err.message;
    } catch {
      message = err.message;
    }
  }

  // Log all 500 errors or specific critical failures
  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url, body: req.body } }, 'Unhandled Server Error');
  }

  res.status(statusCode).json({
    error: message,
    status: 'error',
    code: statusCode,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
