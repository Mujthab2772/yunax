import { Coupon } from '../entities/Coupon';

export interface ICouponRepository {
  getByCode(code: string): Promise<Coupon | null>;
  incrementUsage(id: string): Promise<void>;
  save(coupon: Coupon): Promise<Coupon>;
}
