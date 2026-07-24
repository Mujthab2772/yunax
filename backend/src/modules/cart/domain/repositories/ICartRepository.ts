import { Cart } from '../entities/Cart';

export interface ICartRepository {
  getByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<Cart>;
  clear(userId: string): Promise<void>;
}
