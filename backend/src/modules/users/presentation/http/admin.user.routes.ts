import { Router } from 'express';
import { AdminUserController } from './AdminUserController';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { AdminMiddleware } from './middleware/AdminMiddleware';
import { validateRequest } from '../../../../infrastructure/middleware/validateRequest';
import { z } from 'zod';

const adminCreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.string().optional()
  })
});

const adminUpdateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.string().optional()
  })
});

export function createAdminUserRoutes(
  adminUserController: AdminUserController,
  authMiddleware: AuthMiddleware,
  adminMiddleware: AdminMiddleware
): Router {
  const router = Router();
  
  router.use(authMiddleware.requireAuth);
  router.use(adminMiddleware.requireAdmin);
  
  /**
   * @openapi
   * /api/v1/admin/users:
   *   get:
   *     summary: List all users (Admin only)
   *     tags: [Admin Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of users
   */
  router.get('/', adminUserController.getAll);

  /**
   * @openapi
   * /api/v1/admin/users:
   *   post:
   *     summary: Create a new user (Admin only)
   *     tags: [Admin Users]
   *     security:
   *       - bearerAuth: []
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
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created
   */
  router.post('/', validateRequest(adminCreateUserSchema), adminUserController.create);

  /**
   * @openapi
   * /api/v1/admin/users/{id}:
   *   put:
   *     summary: Update a user (Admin only)
   *     tags: [Admin Users]
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
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               role:
   *                 type: string
   *     responses:
   *       200:
   *         description: User updated
   */
  router.put('/:id', validateRequest(adminUpdateUserSchema), adminUserController.update);

  /**
   * @openapi
   * /api/v1/admin/users/{id}:
   *   delete:
   *     summary: Delete a user (Admin only)
   *     tags: [Admin Users]
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
   *         description: User deleted
   */
  router.delete('/:id', adminUserController.delete);
  
  return router;
}
