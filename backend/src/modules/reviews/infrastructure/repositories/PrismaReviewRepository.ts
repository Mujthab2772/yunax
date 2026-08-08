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
        status: review.status,
        createdAt: review.createdAt,
      }
    });

    return this.mapToEntity(record);
  }

  public async getByProductId(productId: string): Promise<Review[]> {
    const records = await prisma.review.findMany({
      where: { productId, status: 'approved' },
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

  public async listAllAdmin(): Promise<any[]> {
    const records = await prisma.review.findMany({
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return records.map(r => ({
      _id: r.id, // Support old frontend expectation
      id: r.id,
      rating: r.rating,
      text: r.comment,
      status: r.status,
      createdAt: r.createdAt,
      userName: r.user?.name || 'Customer',
      productName: r.product?.name,
      slug: r.product?.slug
    }));
  }

  public async getById(id: string): Promise<Review | null> {
    const record = await prisma.review.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async delete(id: string): Promise<void> {
    await prisma.review.delete({ where: { id } }).catch(() => {});
  }

  private mapToEntity(record: any): Review {
    return new Review(
      record.id,
      record.userId,
      record.productId,
      record.rating,
      record.comment,
      record.status,
      record.createdAt
    );
  }
}
