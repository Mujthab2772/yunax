import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export class DeleteOrder {
  constructor(private readonly orderRepository: IOrderRepository) {}

  public async execute(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
