import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ApiError } from '../../../../utils/ApiError';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';

export class CancelOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(id: string, userId: string, isAdmin: boolean): Promise<any> {
    const order = await this.orderRepository.getById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    if (!isAdmin && order.userId !== userId) {
      throw new ApiError(403, 'Unauthorized');
    }

    order.status = 'cancelled' as any;
    
    const historyEntry = { status: 'cancelled', note: isAdmin ? 'Cancelled by admin' : 'Cancelled by customer', at: new Date().toISOString() };
    if (!order.statusHistory) {
      order.statusHistory = [historyEntry];
    } else if (Array.isArray(order.statusHistory)) {
      order.statusHistory.push(historyEntry);
    } else {
      order.statusHistory = [historyEntry];
    }

    await this.orderRepository.save(order);

    // Replenish stock
    for (const item of order.items) {
      await this.productRepository.updateStock(item.productId, item.quantity).catch(() => {});
    }

    return order;
  }
}
