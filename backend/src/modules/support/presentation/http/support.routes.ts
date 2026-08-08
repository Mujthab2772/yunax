import { Router } from 'express';
import { SupportController } from './SupportController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from '../../../users/presentation/http/middleware/AdminMiddleware';

export function createSupportRoutes(
  supportController: SupportController,
  authMiddleware: AuthMiddleware,
  adminMiddleware: AdminMiddleware
): Router {
  const router = Router();
  
  /**
   * @openapi
   * /api/v1/support/contact:
   *   post:
   *     summary: Submit a contact message
   *     tags: [Support]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               message:
   *                 type: string
   *               phone:
   *                 type: string
   *               subject:
   *                 type: string
   *     responses:
   *       201:
   *         description: Message submitted
   */
  router.post('/contact', supportController.contact);
  
  /**
   * @openapi
   * /api/v1/support/messages:
   *   get:
   *     summary: Get all support messages (Admin only)
   *     tags: [Support]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of messages
   */
  router.get('/messages/unread-count', authMiddleware.requireAuth, adminMiddleware.requireAdmin, supportController.getUnreadCount);
  router.get('/messages', authMiddleware.requireAuth, adminMiddleware.requireAdmin, supportController.getMessages);
  router.patch('/messages/:id/status', authMiddleware.requireAuth, adminMiddleware.requireAdmin, supportController.updateStatus);
  
  return router;
}
