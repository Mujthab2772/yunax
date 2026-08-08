import { Router } from 'express';
import { AdminReviewController } from './AdminReviewController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from '../../../users/presentation/http/middleware/AdminMiddleware';

export function createAdminReviewRoutes(
  adminReviewController: AdminReviewController,
  authMiddleware: AuthMiddleware,
  adminMiddleware: AdminMiddleware
): Router {
  const router = Router();
  
  router.use(authMiddleware.requireAuth);
  router.use(adminMiddleware.requireAdmin);
  
  /**
   * @openapi
   * /api/v1/reviews/admin:
   *   get:
   *     summary: List all reviews (Admin only)
   *     tags: [Admin Reviews]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of reviews
   */
  router.get('/admin', adminReviewController.getAll);

  /**
   * @openapi
   * /api/v1/reviews/{id}/status:
   *   patch:
   *     summary: Update a review status (Admin only)
   *     tags: [Admin Reviews]
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
   *     responses:
   *       200:
   *         description: Review status updated
   */
  router.patch('/:id/status', adminReviewController.updateStatus);

  /**
   * @openapi
   * /api/v1/reviews/{id}:
   *   delete:
   *     summary: Delete a review (Admin only)
   *     tags: [Admin Reviews]
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
   *         description: Review deleted
   */
  router.delete('/:id', adminReviewController.delete);
  
  return router;
}
