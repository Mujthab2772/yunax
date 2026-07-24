import { Router } from 'express';
import { WishlistController } from './WishlistController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';

export function createWishlistRoutes(
  wishlistController: WishlistController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();
  
  router.get('/', authMiddleware.requireAuth, wishlistController.getWishlist);
  router.post('/:productId/toggle', authMiddleware.requireAuth, wishlistController.toggleWishlist);
  
  return router;
}
