import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ICartRepository } from '../../../cart/domain/repositories/ICartRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { ICouponRepository } from '../../../coupons/domain/repositories/ICouponRepository';
import { IPaymentGateway } from '../ports/IPaymentGateway';
import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { ApiError } from '../../../../utils/ApiError';
import crypto from 'crypto';

export class PlaceOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository,
    private readonly couponRepository: ICouponRepository,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  public async execute(userId: string, couponCode?: string): Promise<{ order: Order; clientSecret: string }> {
    const cart = await this.cartRepository.getByUserId(userId);
    
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cannot place an order with an empty cart');
    }

    const orderItems: OrderItem[] = [];
    for (const item of cart.items) {
      const product = await this.productRepository.getById(item.productId);
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} no longer exists`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      orderItems.push(new OrderItem(
        product.id,
        product.name,
        item.priceAtTimeOfAdding,
        item.quantity
      ));
    }

    let totalAmount = cart.totalPrice();
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode) {
      const coupon = await this.couponRepository.getByCode(couponCode);
      if (!coupon || !coupon.isValid()) {
        throw new ApiError(400, 'Invalid or expired coupon code');
      }
      const discount = coupon.calculateDiscount(totalAmount);
      totalAmount = Math.max(0, totalAmount - discount);
      appliedCouponCode = couponCode;
    }

    const orderId = crypto.randomUUID();
    const order = new Order(orderId, userId, orderItems, totalAmount, undefined, undefined, appliedCouponCode);

    await this.orderRepository.save(order);
    await this.cartRepository.clear(userId);

    const paymentInfo = await this.paymentGateway.createPaymentIntent(totalAmount, 'usd', orderId);

    return { order, clientSecret: paymentInfo.clientSecret };
  }
}
