import { Router } from 'express';
import { CartController } from './CartController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';

export function createCartRoutes(cartController: CartController, authMiddleware: AuthMiddleware): Router {
  const router = Router();
  
  router.use(authMiddleware.requireAuth);
  
  router.get('/', cartController.getCart);
  router.post('/items', cartController.addItem);
  router.patch('/items/:productId', cartController.updateQuantity);
  router.delete('/items/:productId', cartController.removeItem);
  router.delete('/', cartController.clearCart);
  
  return router;
}
