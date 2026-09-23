import { Router } from 'express';
import { AuthController } from './AuthController';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { validateRequest } from '../../../../infrastructure/middleware/validateRequest';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

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
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   */
  router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);

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
  router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
  
  router.post('/admin/login', authLimiter, validateRequest(loginSchema), authController.adminLogin);
  router.post('/admin/signup', authLimiter, validateRequest(registerSchema), authController.adminSignup);
  router.post('/logout', authController.logout);
  router.post('/forgot-password', authLimiter, authController.forgotPassword);
  router.post('/verify-reset-otp', authLimiter, authController.verifyResetOtp);
  router.post('/reset-password', authLimiter, authController.resetPassword);
  
  // Protected Routes
  router.get('/me', authMiddleware.requireAuth, authController.getMe);
  router.put('/me', authMiddleware.requireAuth, authController.updateMe);
  router.put('/me/addresses', authMiddleware.requireAuth, authController.updateAddresses);
  
  return router;
}
