import { Router } from 'express';
import { OrderController } from './OrderController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from '../../../users/presentation/http/middleware/AdminMiddleware';

export function createOrderRoutes(orderController: OrderController, authMiddleware: AuthMiddleware, adminMiddleware: AdminMiddleware): Router {
  const router = Router();
  
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
  router.post('/', authMiddleware.requireAuth, orderController.checkout);
  router.post('/quote', orderController.quote);
  router.post('/verify', authMiddleware.requireAuth, orderController.verifyPayment);
  /**
   * @openapi
   * /api/v1/orders:
   *   get:
   *     summary: Get order history (all orders for admin, user's orders for customer)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of orders
   */
  router.get('/', authMiddleware.requireAuth, orderController.getHistory);
  
  /**
   * @openapi
   * /api/v1/orders/{id}/status:
   *   patch:
   *     summary: Update order status (Admin only)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *               note:
   *                 type: string
   *     responses:
   *       200:
   *         description: Order status updated
   */
  router.patch('/:id/status', authMiddleware.requireAuth, adminMiddleware.requireAdmin, orderController.updateStatus);

  /**
   * @openapi
   * /api/v1/orders/{id}/cancel:
   *   patch:
   *     summary: Cancel an order (Admin or Owner)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order cancelled
   */
  router.patch('/:id/cancel', authMiddleware.requireAuth, orderController.cancelOrder);

  /**
   * @openapi
   * /api/v1/orders/{id}:
   *   delete:
   *     summary: Delete an order (Admin only)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order deleted
   */
  router.delete('/:id', adminMiddleware.requireAdmin, orderController.deleteOrder);

  /**
   * @openapi
   * /api/v1/orders/{id}/invoice:
   *   get:
   *     summary: Get order invoice data
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invoice data
   */
  router.get('/:id/invoice', authMiddleware.requireAuth, orderController.getInvoice);
  
  return router;
}
