import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';

export class ListCategories {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  public async execute(): Promise<Category[]> {
    return this.categoryRepository.listAll();
  }
}
