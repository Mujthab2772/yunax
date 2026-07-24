import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';

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
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map((e: any) => e.message).join(', ');
  }

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
