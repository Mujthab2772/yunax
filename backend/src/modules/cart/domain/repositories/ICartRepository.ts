import { Cart } from '../entities/Cart';

export interface ICartRepository {
  getByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<Cart>;
  clear(userId: string): Promise<void>;
  
  // Atomic operations
  addOrUpdateItem(userId: string, productId: string, quantity: number, price: number): Promise<Cart>;
  removeItem(userId: string, productId: string): Promise<Cart>;
  updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart>;
}
