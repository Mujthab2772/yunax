import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { CartItem } from '../../domain/entities/CartItem';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaCartRepository implements ICartRepository {
  public async getByUserId(userId: string): Promise<Cart | null> {
    const record = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });
    
    if (!record) return null;
    
    const items = record.items.map((item: any) => new CartItem(
      item.productId,
      item.quantity,
      item.priceAtTimeOfAdding
    ));
    
    return new Cart(record.userId, items);
  }

  public async save(cart: Cart): Promise<Cart> {
    const record = await prisma.cart.upsert({
      where: { userId: cart.userId },
      update: {
        items: {
          deleteMany: {},
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTimeOfAdding: item.priceAtTimeOfAdding
          }))
        }
      },
      create: {
        userId: cart.userId,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTimeOfAdding: item.priceAtTimeOfAdding
          }))
        }
      },
      include: { items: true }
    });

    const items = record.items.map((item: any) => new CartItem(
      item.productId,
      item.quantity,
      item.priceAtTimeOfAdding
    ));

    return new Cart(record.userId, items);
  }

  public async clear(userId: string): Promise<void> {
    await prisma.cart.delete({ where: { userId } }).catch(() => {});
  }
}
