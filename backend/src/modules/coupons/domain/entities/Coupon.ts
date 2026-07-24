export type DiscountType = 'FIXED' | 'PERCENT';

export class Coupon {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly discountType: DiscountType,
    public readonly discountValue: number,
    public readonly expirationDate: Date,
    public readonly usageLimit: number,
    public usedCount: number
  ) {}

  public isValid(): boolean {
    if (new Date() > this.expirationDate) return false;
    if (this.usedCount >= this.usageLimit) return false;
    return true;
  }

  public calculateDiscount(totalAmount: number): number {
    if (!this.isValid()) return 0;
    
    if (this.discountType === 'FIXED') {
      return Math.min(this.discountValue, totalAmount);
    }
    
    if (this.discountType === 'PERCENT') {
      return (totalAmount * this.discountValue) / 100;
    }
    return 0;
  }
}
