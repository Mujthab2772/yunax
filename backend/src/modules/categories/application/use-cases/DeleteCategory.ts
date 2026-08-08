import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

export class DeleteCategory {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  public async execute(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
