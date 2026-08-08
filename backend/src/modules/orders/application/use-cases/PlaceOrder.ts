import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ICartRepository } from '../../../cart/domain/repositories/ICartRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { ICouponRepository } from '../../../coupons/domain/repositories/ICouponRepository';
import { IPaymentGateway } from '../ports/IPaymentGateway';
import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { OrderStatus } from '../../domain/entities/OrderStatus';
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

  public async execute(
    userId: string,
    items: any[],
    shippingAddress: any,
    paymentMethod: string,
    couponCode?: string
  ): Promise<{ order: Order; clientSecret?: string }> {
    
    if (!items || items.length === 0) {
      throw new ApiError(400, 'Cannot place an order with empty items');
    }

    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = await this.productRepository.getById(item.productId);
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} no longer exists`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      orderItems.push(new OrderItem(
        product.id,
        product.name,
        product.priceCents,
        item.quantity
      ));
    }

    let subtotalAmount = orderItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    let totalAmount = subtotalAmount;
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
    const order = new Order(
      orderId, 
      userId, 
      orderItems, 
      totalAmount, 
      subtotalAmount, 
      paymentMethod === 'cod' ? OrderStatus.PENDING : OrderStatus.PAYMENT_PENDING, 
      paymentMethod, 
      shippingAddress, 
      [], 
      undefined, 
      undefined, 
      appliedCouponCode
    );

    let clientSecret = '';
    
    // 1. Create Payment Intent FIRST
    if (paymentMethod !== 'cod' && paymentMethod !== 'bank_transfer') {
      try {
        const paymentInfo = await this.paymentGateway.createPaymentIntent(totalAmount, 'inr', orderId); // Changed to INR assuming razorpay
        clientSecret = paymentInfo.clientSecret;
      } catch (error: any) {
        throw new ApiError(500, `Payment Gateway Error: ${error.message}`);
      }
    }

    // 2. Atomically save order and reserve stock
    try {
      await this.orderRepository.saveWithStockReservation(order, orderItems.map(i => ({ 
        productId: i.productId, 
        quantity: i.quantity,
        name: i.name
      })));
    } catch (error: any) {
      if (error.message.includes('INSUFFICIENT_STOCK')) {
        throw new ApiError(400, error.message);
      }
      throw new ApiError(500, `Failed to place order: ${error.message}`);
    }

    // 3. Clear cart
    try {
      await this.cartRepository.clear(userId);
    } catch(e) {
      // We can log this, but it shouldn't fail the order if the cart couldn't be cleared.
      console.error('Failed to clear cart:', e);
    }

    return { order, clientSecret };
  }
}
