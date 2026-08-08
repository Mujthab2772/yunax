import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { Cart } from '../../domain/entities/Cart';
import { ApiError } from '../../../../utils/ApiError';

export class UpdateCartItemQuantity {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(userId: string, productId: string, quantity: number): Promise<Cart> {
    if (typeof productId !== 'string' || !productId.trim()) {
      throw new ApiError(400, 'Invalid productId: must be a string');
    }
    
    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity) || quantity > 1000) {
      throw new ApiError(400, 'Invalid quantity');
    }

    if (quantity === 0) {
      return this.cartRepository.removeItem(userId, productId);
    }

    const product = await this.productRepository.getById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (quantity > product.stock) {
      throw new ApiError(400, 'Insufficient stock');
    }

    return this.cartRepository.updateItemQuantity(userId, product.id, quantity);
  }
}
