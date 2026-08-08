import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { DecrementProductStock } from '../../../products/application/use-cases/DecrementProductStock';
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository';
import { IEmailService } from '../../../../infrastructure/notifications/IEmailService';
import { ApplyCouponToOrder } from '../../../coupons/application/use-cases/ApplyCouponToOrder';
import { ApiError } from '../../../../utils/ApiError';

export class HandlePaymentSuccess {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly decrementStock: DecrementProductStock,
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly applyCouponUseCase: ApplyCouponToOrder
  ) {}

  public async execute(orderId: string): Promise<void> {
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.markAsPaid();
    await this.orderRepository.save(order);


    const user = await this.userRepository.findById(order.userId);
    if (user) {
      this.emailService.sendOrderConfirmation(user.email, order).catch(console.error);
    }

    if (order.appliedCouponCode) {
      await this.applyCouponUseCase.execute(order.appliedCouponCode);
    }
  }
}
