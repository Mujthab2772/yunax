import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';

export class GetOrderHistory {
  constructor(private readonly orderRepository: IOrderRepository) {}

  public async execute(userId: string): Promise<Order[]> {
    return this.orderRepository.getByUserId(userId);
  }
}
