import { Router } from 'express';
import { ProductController } from './ProductController';
import { UploadController } from './UploadController';
import { AuthMiddleware } from '../../../users/presentation/http/middleware/AuthMiddleware';
import { AdminMiddleware } from '../../../users/presentation/http/middleware/AdminMiddleware';
import { validateRequest } from '../../../../infrastructure/middleware/validateRequest';
import { z } from 'zod';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.') as any, false);
    }
  }
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    priceCents: z.number().int().positive('Price must be greater than zero'),
    stock: z.number().int().nonnegative('Stock must be zero or positive'),
    category: z.string().min(1, 'Category is required'),
    images: z.array(z.string()).optional()
  })
});

export function createProductRoutes(
  productController: ProductController,
  uploadController: UploadController,
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
  
  router.post('/', adminOnly, validateRequest(createProductSchema), productController.createProduct);
  router.post('/upload', adminOnly, upload.single('image'), uploadController.uploadImage);
  router.put('/:id', adminOnly, validateRequest(createProductSchema), productController.updateProduct);
  router.patch('/:id', adminOnly, productController.updateProduct);
  router.delete('/:id', adminOnly, productController.deleteProduct);
  
  return router;
}
