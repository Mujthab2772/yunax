import { Router } from 'express';
import { CategoryController } from './CategoryController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from '../../../users/presentation/http/middleware/AdminMiddleware';
import { validateRequest } from '../../../../infrastructure/middleware/validateRequest';
import { z } from 'zod';

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional()
  })
});

export function createCategoryRoutes(
  categoryController: CategoryController,
  authMiddleware: AuthMiddleware,
  adminMiddleware: AdminMiddleware
): Router {
  const router = Router();
  
  /**
   * @openapi
   * /api/v1/categories:
   *   get:
   *     summary: Get all categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: A list of categories
   */
  router.get('/', categoryController.getAll);
  
  const adminOnly = [authMiddleware.requireAuth, adminMiddleware.requireAdmin];
  
  /**
   * @openapi
   * /api/v1/categories:
   *   post:
   *     summary: Create a category
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       201:
   *         description: Created category
   */
  router.post('/', adminOnly, validateRequest(createCategorySchema), categoryController.create);
  
  /**
   * @openapi
   * /api/v1/categories/{id}:
   *   put:
   *     summary: Update a category
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Updated category
   */
  router.put('/:id', adminOnly, validateRequest(createCategorySchema), categoryController.update);
  
  /**
   * @openapi
   * /api/v1/categories/{id}:
   *   delete:
   *     summary: Delete a category
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Category deleted
   */
  router.delete('/:id', adminOnly, categoryController.delete);
  
  return router;
}
