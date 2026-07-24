import { Router } from 'express';
import { AuthController } from './AuthController';
import { AuthMiddleware } from './middleware/AuthMiddleware';

export function createAuthRoutes(authController: AuthController, authMiddleware: AuthMiddleware): Router {
  const router = Router();
  
  /**
   * @openapi
   * /api/v1/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   */
  router.post('/register', authController.register);

  /**
   * @openapi
   * /api/v1/auth/login:
   *   post:
   *     summary: Login a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful, returns JWT
   */
  router.post('/login', authController.login);
  
  // Protected Routes
  router.get('/me', authMiddleware.requireAuth, authController.getMe);
  
  return router;
}
