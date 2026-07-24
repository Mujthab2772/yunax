import { Router } from 'express';
import { OrderController } from './OrderController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';

export function createOrderRoutes(orderController: OrderController, authMiddleware: AuthMiddleware): Router {
  const router = Router();
  
  router.use(authMiddleware.requireAuth);
  
  /**
   * @openapi
   * /api/v1/orders/checkout:
   *   post:
   *     summary: Checkout the cart and place an order
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               couponCode:
   *                 type: string
   *     responses:
   *       201:
   *         description: Order placed successfully, returns client secret for payment
   */
  router.post('/checkout', orderController.checkout);
  router.get('/', orderController.getHistory);
  
  return router;
}
