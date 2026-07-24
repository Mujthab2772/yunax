import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';

export class ToggleWishlist {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  public async execute(userId: string, productId: string): Promise<{ action: 'added' | 'removed' }> {
    const wishlist = await this.wishlistRepository.getByUserId(userId);
    
    if (wishlist.productIds.includes(productId)) {
      await this.wishlistRepository.removeProduct(userId, productId);
      return { action: 'removed' };
    } else {
      await this.wishlistRepository.addProduct(userId, productId);
      return { action: 'added' };
    }
  }
}
