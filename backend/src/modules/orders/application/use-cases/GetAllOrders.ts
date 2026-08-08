import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export class GetAllOrders {
  constructor(private readonly orderRepository: IOrderRepository) {}

  public async execute(): Promise<any[]> {
    return this.orderRepository.listAll();
  }
}
