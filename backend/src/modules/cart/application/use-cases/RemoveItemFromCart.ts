import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { ApiError } from '../../../../utils/ApiError';

export class RemoveItemFromCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  public async execute(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartRepository.getByUserId(userId);
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.removeItem(productId);
    return this.cartRepository.save(cart);
  }
}
