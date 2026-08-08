import { IProductRepository } from '../../domain/repositories/IProductRepository';

export class DecrementProductStock {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.getById(item.productId);
      if (product && product.stock >= item.quantity) {
        await this.productRepository.updateStock(item.productId, -item.quantity);
      } else {
        console.error(`ALERT: Oversold or missing product ${item.productId}! Manual intervention required.`);
      }
    }
  }
}
