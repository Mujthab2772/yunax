import { Router } from 'express';
import { ProductController } from './ProductController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from '../../../users/presentation/http/middleware/AdminMiddleware';
import { validateRequest } from '../../../../infrastructure/middleware/validateRequest';
import { z } from 'zod';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.preprocess((val) => Number(val), z.number().positive('Price must be greater than zero')),
    stock_quantity: z.preprocess((val) => Number(val), z.number().int().nonnegative('Stock must be zero or positive')),
    category_id: z.string().min(1, 'Category is required')
  })
});

export function createProductRoutes(
  productController: ProductController,
  authMiddleware: AuthMiddleware,
  adminMiddleware: AdminMiddleware
): Router {
  const router = Router();
  
  /**
   * @openapi
   * /api/v1/products:
   *   get:
   *     summary: Get all products with search, filter, and pagination
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: A list of products
   */
  router.get('/', productController.getAllProducts);
  router.get('/:id', productController.getProduct);
  
  const adminOnly = [authMiddleware.requireAuth, adminMiddleware.requireAdmin];
  
  router.post('/', adminOnly, upload.single('image'), validateRequest(createProductSchema), productController.createProduct);
  router.patch('/:id', adminOnly, productController.updateProduct);
  router.delete('/:id', adminOnly, productController.deleteProduct);
  
  return router;
}
