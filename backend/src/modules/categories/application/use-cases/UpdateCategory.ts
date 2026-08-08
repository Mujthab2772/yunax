import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { ApiError } from '../../../../utils/ApiError';

export class UpdateCategory {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  public async execute(id: string, updates: Partial<Category>): Promise<Category> {
    const category = await this.categoryRepository.getById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    if (updates.name !== undefined) category.name = updates.name;
    if (updates.slug !== undefined) {
      const slug = updates.slug || updates.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || category.slug;
      
      if (slug !== category.slug) {
        const existing = await this.categoryRepository.getBySlug(slug);
        if (existing) {
          throw new ApiError(400, 'A category with this slug already exists');
        }
      }
      
      category.slug = slug;
    }
    if (updates.image !== undefined) category.image = updates.image;
    if (updates.description !== undefined) category.description = updates.description;

    return this.categoryRepository.update(category);
  }
}
