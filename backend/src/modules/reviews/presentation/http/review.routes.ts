import { Router } from 'express';
import { ReviewController } from './ReviewController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';

export function createReviewRoutes(
  reviewController: ReviewController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router({ mergeParams: true });
  
  router.get('/', reviewController.getReviews);
  router.post('/', authMiddleware.requireAuth, reviewController.addReview);
  
  return router;
}
