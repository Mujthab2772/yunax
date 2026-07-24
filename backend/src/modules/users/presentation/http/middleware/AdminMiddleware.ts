import { Request, Response, NextFunction } from 'express';

export class AdminMiddleware {
  public requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!req.user.role || req.user.role.toLowerCase() !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      return;
    }

    next();
  };
}
