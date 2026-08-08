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

  public async addOrUpdateItem(userId: string, productId: string, quantity: number, price: number): Promise<Cart> {
    const cart = (await this.getByUserId(userId)) || new Cart(userId);
    cart.addItem(productId, price, quantity);
    return this.save(cart);
  }

  public async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = (await this.getByUserId(userId)) || new Cart(userId);
    cart.removeItem(productId);
    return this.save(cart);
  }

  public async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = (await this.getByUserId(userId)) || new Cart(userId);
    cart.updateQuantity(productId, quantity);
    return this.save(cart);
  }
}
