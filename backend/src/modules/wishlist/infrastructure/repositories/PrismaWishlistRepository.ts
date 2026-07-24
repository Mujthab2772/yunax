import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { Wishlist } from '../../domain/entities/Wishlist';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaWishlistRepository implements IWishlistRepository {
  public async addProduct(userId: string, productId: string): Promise<void> {
    await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      }
    }).catch(() => {
      // Ignore if it already exists (Prisma throws if composite key violation)
    });
  }

  public async removeProduct(userId: string, productId: string): Promise<void> {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    }).catch(() => {
      // Ignore if it doesn't exist
    });
  }

  public async getByUserId(userId: string): Promise<Wishlist> {
    const records = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: 'desc' }
    });

    const productIds = records.map((record: any) => record.productId);
    return new Wishlist(userId, productIds);
  }
}
