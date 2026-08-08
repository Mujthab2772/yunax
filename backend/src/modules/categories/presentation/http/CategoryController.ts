import type { Request, Response, NextFunction } from 'express';
import { ListCategories } from '../../application/use-cases/ListCategories';
import { CreateCategory } from '../../application/use-cases/CreateCategory';
import { UpdateCategory } from '../../application/use-cases/UpdateCategory';
import { DeleteCategory } from '../../application/use-cases/DeleteCategory';

export class CategoryController {
  constructor(
    private readonly listCategoriesUseCase: ListCategories,
    private readonly createCategoryUseCase: CreateCategory,
    private readonly updateCategoryUseCase: UpdateCategory,
    private readonly deleteCategoryUseCase: DeleteCategory
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.listCategoriesUseCase.execute();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.createCategoryUseCase.execute(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const category = await this.updateCategoryUseCase.execute(id, req.body);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await this.deleteCategoryUseCase.execute(id);
      res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  };
}
