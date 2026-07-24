import { Router } from 'express';
import { CouponController } from './CouponController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';

export function createCouponRoutes(
  couponController: CouponController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();
  
  router.post('/validate', authMiddleware.requireAuth, couponController.validateCoupon);
  
  return router;
}
