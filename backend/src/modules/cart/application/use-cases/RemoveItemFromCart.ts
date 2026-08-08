import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { ApiError } from '../../../../utils/ApiError';

export class RemoveItemFromCart {
  constructor(private readonly cartRepository: ICartRepository) {}

  public async execute(userId: string, productId: string): Promise<Cart> {
    if (typeof productId !== 'string' || !productId.trim()) {
      throw new ApiError(400, 'Invalid productId: must be a string');
    }
    
    return this.cartRepository.removeItem(userId, productId);
  }
}
