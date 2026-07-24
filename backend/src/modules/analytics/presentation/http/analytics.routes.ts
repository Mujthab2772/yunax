import { Router } from 'express';
import { AdminAnalyticsController } from './AdminAnalyticsController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from '../../../users/presentation/http/middleware/AdminMiddleware';

export function createAnalyticsRoutes(
  adminAnalyticsController: AdminAnalyticsController,
  authMiddleware: AuthMiddleware,
  adminMiddleware: AdminMiddleware
): Router {
  const router = Router();
  
  router.get(
    '/stats',
    authMiddleware.requireAuth,
    adminMiddleware.requireAdmin,
    adminAnalyticsController.getStats
  );
  
  return router;
}
