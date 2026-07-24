import { ICouponRepository } from '../../domain/repositories/ICouponRepository';
import { Coupon } from '../../domain/entities/Coupon';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaCouponRepository implements ICouponRepository {
  public async getByCode(code: string): Promise<Coupon | null> {
    const record = await prisma.coupon.findUnique({
      where: { code }
    });

    return record ? this.mapToEntity(record) : null;
  }

  public async incrementUsage(id: string): Promise<void> {
    await prisma.coupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } }
    });
  }

  public async save(coupon: Coupon): Promise<Coupon> {
    const record = await prisma.coupon.upsert({
      where: { id: coupon.id },
      update: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expirationDate: coupon.expirationDate,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
      },
      create: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expirationDate: coupon.expirationDate,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
      }
    });

    return this.mapToEntity(record);
  }

  private mapToEntity(record: any): Coupon {
    return new Coupon(
      record.id,
      record.code,
      record.discountType,
      record.discountValue,
      record.expirationDate,
      record.usageLimit,
      record.usedCount
    );
  }
}
