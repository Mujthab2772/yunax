import { ICouponRepository } from '../../domain/repositories/ICouponRepository';
import { ApiError } from '../../../../utils/ApiError';

export class ValidateCoupon {
  constructor(private readonly couponRepository: ICouponRepository) {}

  public async execute(code: string, cartTotal: number): Promise<{ discount: number, finalTotal: number }> {
    const coupon = await this.couponRepository.getByCode(code);
    
    if (!coupon || !coupon.isValid()) {
      throw new ApiError(400, 'Invalid or expired coupon code');
    }
    
    const discount = coupon.calculateDiscount(cartTotal);
    const finalTotal = Math.max(0, cartTotal - discount);
    
    return { discount, finalTotal };
  }
}
