import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { Cart } from '../../domain/entities/Cart';
import { ApiError } from '../../../../utils/ApiError';

export class AddItemToCart {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this.productRepository.getById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    let cart = await this.cartRepository.getByUserId(userId);
    if (!cart) {
      cart = new Cart(userId);
    }

    cart.addItem(product.id, product.priceCents, quantity);

    return this.cartRepository.save(cart);
  }
}
