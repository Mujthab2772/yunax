import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.body.password',
    'req.body.passwordConfirm',
    'req.body.token',
    'req.body.otp',
    'res.headers["set-cookie"]'
  ],
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    : undefined // In production, log as raw JSON
});
