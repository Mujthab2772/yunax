import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IImageUploader } from '../ports/IImageUploader';
import { Product } from '../../domain/entities/Product';
import crypto from 'crypto';

export class CreateProduct {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly imageUploader: IImageUploader
  ) {}

  public async execute(data: any): Promise<Product> {
    const product = new Product(
      crypto.randomUUID(),
      data.name,
      data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      data.description,
      data.priceCents,
      data.stock,
      data.category,
      data.images || []
    );

    return this.productRepository.save(product);
  }
}
