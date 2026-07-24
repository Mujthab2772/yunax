import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { Review } from '../../domain/entities/Review';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaReviewRepository implements IReviewRepository {
  public async save(review: Review): Promise<Review> {
    const record = await prisma.review.upsert({
      where: {
        id: review.id,
      },
      update: {
        rating: review.rating,
        comment: review.comment,
      },
      create: {
        id: review.id,
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      }
    });

    return this.mapToEntity(record);
  }

  public async getByProductId(productId: string): Promise<Review[]> {
    const records = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });

    return records.map((record: any) => this.mapToEntity(record));
  }

  public async getByUserIdAndProductId(userId: string, productId: string): Promise<Review | null> {
    const record = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    return record ? this.mapToEntity(record) : null;
  }

  private mapToEntity(record: any): Review {
    return new Review(
      record.id,
      record.userId,
      record.productId,
      record.rating,
      record.comment,
      record.createdAt
    );
  }
}
