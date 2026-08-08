import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';

export class ClearCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  public async execute(userId: string): Promise<Cart> {
    await this.cartRepository.clear(userId);
    return new Cart(userId);
  }
}
