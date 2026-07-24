import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';

export class InMemoryCartRepository implements ICartRepository {
  private carts = new Map<string, Cart>();

  public async getByUserId(userId: string): Promise<Cart | null> {
    return this.carts.get(userId) || null;
  }

  public async save(cart: Cart): Promise<Cart> {
    this.carts.set(cart.userId, cart);
    return cart;
  }

  public async clear(userId: string): Promise<void> {
    this.carts.delete(userId);
  }
}
