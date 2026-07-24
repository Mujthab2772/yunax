import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { NotFoundError } from '../../../../infrastructure/errors/NotFoundError';

export class GetProductById {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(id: string): Promise<Product> {
    const product = await this.productRepository.getById(id);
    
    if (!product) {
      throw new NotFoundError('Product Not Found');
    }
    
    return product;
  }
}
