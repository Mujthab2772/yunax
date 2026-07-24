import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IImageUploader } from '../ports/IImageUploader';
import { Product } from '../../domain/entities/Product';
import crypto from 'crypto';

export class CreateProduct {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly imageUploader: IImageUploader
  ) {}

  public async execute(data: any, imageBuffer?: Buffer, imageName?: string): Promise<Product> {
    const imageUrls: string[] = [];
    
    if (imageBuffer && imageName) {
      const url = await this.imageUploader.upload(imageBuffer, imageName);
      imageUrls.push(url);
    }

    const product = new Product(
      crypto.randomUUID(),
      data.name,
      data.description,
      Number(data.price),
      Number(data.stockQuantity || data.stock_quantity || 0),
      data.categoryId || data.category_id,
      imageUrls
    );

    return this.productRepository.save(product);
  }
}
