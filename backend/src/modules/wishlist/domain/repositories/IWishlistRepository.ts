import { Wishlist } from '../entities/Wishlist';

export interface IWishlistRepository {
  addProduct(userId: string, productId: string): Promise<void>;
  removeProduct(userId: string, productId: string): Promise<void>;
  getByUserId(userId: string): Promise<Wishlist>;
}
