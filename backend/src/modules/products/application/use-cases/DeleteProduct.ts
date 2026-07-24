import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ApiError } from '../../../../utils/ApiError';

export class DeleteProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(id: string): Promise<void> {
    const product = await this.productRepository.getById(id);
    if (!product) throw new ApiError(404, 'Product not found');

    await this.productRepository.delete(id);
  }
}
