import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ApiError } from '../../../../utils/ApiError';

export class UpdateProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(id: string, updates: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.getById(id);
    if (!product) throw new ApiError(404, 'Product not found');

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.description !== undefined) product.description = updates.description;
    
    if (updates.stock_quantity !== undefined) {
      product.stock_quantity = Math.max(0, updates.stock_quantity);
    }
    
    if (updates.category_id !== undefined) product.category_id = updates.category_id;
    if (updates.image_urls !== undefined) product.image_urls = updates.image_urls;

    return this.productRepository.update(product);
  }
}
