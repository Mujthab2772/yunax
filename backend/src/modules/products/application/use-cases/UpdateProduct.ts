import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ApiError } from '../../../../utils/ApiError';

export class UpdateProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(id: string, updates: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.getById(id);
    if (!product) throw new ApiError(404, 'Product not found');

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.slug !== undefined) {
      product.slug = updates.slug || updates.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (updates.priceCents !== undefined) product.priceCents = updates.priceCents;
    if (updates.description !== undefined) product.description = updates.description;
    
    if (updates.stock !== undefined) {
      product.stock = Math.max(0, updates.stock);
    }
    
    if (updates.category !== undefined) product.category = updates.category;
    if (updates.images !== undefined) product.images = updates.images;

    return this.productRepository.update(product);
  }
}
