import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import crypto from 'crypto';
import { ApiError } from '../../../../utils/ApiError';

export class CreateCategory {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  public async execute(data: any): Promise<Category> {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existing = await this.categoryRepository.getBySlug(slug);
    if (existing) {
      throw new ApiError(400, 'A category with this slug already exists');
    }

    const category = new Category(
      crypto.randomUUID(),
      data.name,
      slug,
      data.image || null,
      data.description || null
    );

    return this.categoryRepository.save(category);
  }
}
