import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ApiError } from '../../../../utils/ApiError';

export class GetOrderInvoice {
  constructor(private readonly orderRepository: IOrderRepository) {}

  public async execute(id: string, userId: string, isAdmin: boolean): Promise<any> {
    const order = await this.orderRepository.getById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    if (!isAdmin && order.userId !== userId) {
      throw new ApiError(403, 'Unauthorized');
    }

    return {
      invoiceNumber: `INV-${id.slice(0, 8).toUpperCase()}`,
      orderId: id,
      invoiceIssuedAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      billingDetails: order.shippingAddress, // Fallback if no separate billing
      items: order.items,
      subtotalCents: order.subtotalCents,
      shippingCents: 0,
      discountCents: 0,
      gstRate: 0.18,
      taxCents: Math.round(order.totalCents * 0.18),
      totalCents: order.totalCents
    };
  }
}
