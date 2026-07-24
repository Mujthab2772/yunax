import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { Product } from '../../../products/domain/entities/Product';

export class GetWishlist {
  constructor(
    private readonly wishlistRepository: IWishlistRepository,
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(userId: string): Promise<Product[]> {
    const wishlist = await this.wishlistRepository.getByUserId(userId);
    
    // Concurrently fetch all product entities
    const productPromises = wishlist.productIds.map(id => this.productRepository.getById(id));
    const products = await Promise.all(productPromises);
    
    // Filter out nulls in case a product was deleted from the catalog
    return products.filter((p): p is Product => p !== null);
  }
}
