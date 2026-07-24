import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';

export class GetCartByUserId {
  constructor(private readonly cartRepository: ICartRepository) {}

  public async execute(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.getByUserId(userId);
    return cart || new Cart(userId);
  }
}
