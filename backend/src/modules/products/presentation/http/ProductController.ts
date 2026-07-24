import type { Request, Response, NextFunction } from 'express';
import { ListProducts } from '../../application/use-cases/ListProducts';
import { GetProductById } from '../../application/use-cases/GetProductById';
import { CreateProduct } from '../../application/use-cases/CreateProduct';
import { UpdateProduct } from '../../application/use-cases/UpdateProduct';
import { DeleteProduct } from '../../application/use-cases/DeleteProduct';

export class ProductController {
  constructor(
    private readonly listProducts: ListProducts,
    private readonly getProductById: GetProductById,
    private readonly createProductUseCase: CreateProduct,
    private readonly updateProductUseCase: UpdateProduct,
    private readonly deleteProductUseCase: DeleteProduct
  ) {}

  public getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: any = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      if (req.query.search) query.search = req.query.search as string;
      if (req.query.categoryId) query.categoryId = req.query.categoryId as string;
      if (req.query.minPrice) query.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) query.maxPrice = Number(req.query.maxPrice);

      const result = await this.listProducts.execute(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  public getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'] as string;
      const product = await this.getProductById.execute(id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error); 
    }
  };

  public createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imageBuffer = req.file?.buffer;
      const imageName = req.file?.originalname;
      const product = await this.createProductUseCase.execute(req.body, imageBuffer, imageName);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const product = await this.updateProductUseCase.execute(id, req.body);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };

  public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await this.deleteProductUseCase.execute(id);
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
      next(error);
    }
  };
}
