import pino from 'pino';
import fs from 'fs';

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
  ]
}, pino.multistream([
  { stream: process.stdout },
  { stream: fs.createWriteStream('/tmp/backend-error.log', { flags: 'a' }) }
]));
