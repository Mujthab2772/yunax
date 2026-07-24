import { Router } from 'express';
import { CartController } from './CartController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';

export function createCartRoutes(cartController: CartController, authMiddleware: AuthMiddleware): Router {
  const router = Router();
  
  router.use(authMiddleware.requireAuth);
  
  router.get('/', cartController.getCart);
  router.post('/items', cartController.addItem);
  
  return router;
}
