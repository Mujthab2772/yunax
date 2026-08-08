import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { CartItem } from '../../domain/entities/CartItem';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaCartRepository implements ICartRepository {
  public async getByUserId(userId: string): Promise<Cart | null> {
    const record = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
    
    if (!record) return null;
    
    const items = record.items.map((item: any) => {
      const cartItem = new CartItem(
        item.productId,
        item.quantity,
        item.priceAtTimeOfAdding
      );
      cartItem.product = item.product; // attach product info
      return cartItem;
    });
    
    return new Cart(record.userId, items);
  }

  public async save(cart: Cart): Promise<Cart> {
    // Upsert the cart
    const record = await prisma.cart.upsert({
      where: { userId: cart.userId },
      update: {},
      create: { userId: cart.userId },
    });

    // We can't cleanly sync arrays in Prisma without deleting them if we just use a generic save.
    // However, since we now have discrete use-cases for adding/updating/removing, this generic 'save'
    // is better implemented by just recreating them in a transaction if we want atomic array replacement.
    // A better approach for specific endpoints is to write individual repository methods,
    // but to preserve the existing pattern while fixing concurrency, we can rely on discrete methods.
    
    // For now, atomic replacement in a transaction:
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: record.id } }),
      prisma.cartItem.createMany({
        data: cart.items.map(item => ({
          cartId: record.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTimeOfAdding: item.priceAtTimeOfAdding
        }))
      })
    ]);

    return this.getByUserId(cart.userId) as Promise<Cart>;
  }

  public async addOrUpdateItem(userId: string, productId: string, quantity: number, price: number): Promise<Cart> {
    const record = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: record.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: record.id, productId, quantity, priceAtTimeOfAdding: price }
    });

    return this.getByUserId(userId) as Promise<Cart>;
  }

  public async removeItem(userId: string, productId: string): Promise<Cart> {
    const record = await prisma.cart.findUnique({ where: { userId } });
    if (record) {
      await prisma.cartItem.deleteMany({
        where: { cartId: record.id, productId }
      });
    }
    return (await this.getByUserId(userId)) || new Cart(userId);
  }

  public async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const record = await prisma.cart.findUnique({ where: { userId } });
    if (record) {
      if (quantity <= 0) {
        await prisma.cartItem.deleteMany({ where: { cartId: record.id, productId } });
      } else {
        await prisma.cartItem.updateMany({
          where: { cartId: record.id, productId },
          data: { quantity }
        });
      }
    }
    return (await this.getByUserId(userId)) || new Cart(userId);
  }

  public async clear(userId: string): Promise<void> {
    await prisma.cart.delete({ where: { userId } }).catch(() => {});
  }
}
