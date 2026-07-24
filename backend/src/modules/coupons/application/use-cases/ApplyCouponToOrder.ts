import { ICouponRepository } from '../../domain/repositories/ICouponRepository';

export class ApplyCouponToOrder {
  constructor(private readonly couponRepository: ICouponRepository) {}

  public async execute(code: string): Promise<void> {
    const coupon = await this.couponRepository.getByCode(code);
    if (coupon) {
      await this.couponRepository.incrementUsage(coupon.id);
    }
  }
}
