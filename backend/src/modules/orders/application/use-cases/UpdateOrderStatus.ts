import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ApiError } from '../../../../utils/ApiError';

import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { OrderStatus } from '../../domain/entities/OrderStatus';

export class UpdateOrderStatus {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(id: string, status: string, note?: string): Promise<any> {
    const order = await this.orderRepository.getById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    const previousStatus = order.status;
    order.status = status as any;
    
    const historyEntry = { status, note, at: new Date().toISOString() };
    if (!order.statusHistory) {
      order.statusHistory = [historyEntry];
    } else if (Array.isArray(order.statusHistory)) {
      order.statusHistory.push(historyEntry);
    } else {
      order.statusHistory = [historyEntry];
    }

    if (note && !order.adminNote) {
      order.adminNote = note;
    } else if (note) {
      order.adminNote += `\n${note}`;
    }

    await this.orderRepository.save(order);

    if (status === OrderStatus.CANCELLED && previousStatus !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.productRepository.updateStock(item.productId, item.quantity).catch(() => {});
      }
    } else if (previousStatus === OrderStatus.CANCELLED && status !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.productRepository.updateStock(item.productId, -item.quantity).catch(() => {});
      }
    }

    return order;
  }
}
