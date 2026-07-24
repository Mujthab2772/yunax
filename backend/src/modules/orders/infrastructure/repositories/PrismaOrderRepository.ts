import { IOrderRepository, IOrderAnalytics } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { OrderItem } from '../../domain/entities/OrderItem';
import { OrderStatus } from '../../domain/entities/OrderStatus';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaOrderRepository implements IOrderRepository {
  public async save(order: Order): Promise<Order> {
    const record = await prisma.order.upsert({
      where: { id: order.id },
      update: {
        status: order.status,
        totalAmount: order.totalAmount,
        appliedCouponCode: order.appliedCouponCode ?? null,
      },
      create: {
        id: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        appliedCouponCode: order.appliedCouponCode ?? null,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });

    return this.mapToEntity(record);
  }

  public async getById(id: string): Promise<Order | null> {
    const record = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async getByUserId(userId: string): Promise<Order[]> {
    const records = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    return records.map(record => this.mapToEntity(record));
  }

  public async hasVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: 'PAID',
        items: {
          some: {
            productId
          }
        }
      }
    });
    return !!order;
  }

  public async getAnalytics(): Promise<IOrderAnalytics> {
    const orderStats = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    const topItems = await prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: { order: { status: 'PAID' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    return {
      totalRevenue: orderStats._sum.totalAmount || 0,
      totalOrders: orderStats._count.id,
      topProducts: topItems.map(item => ({
        productId: item.productId,
        name: item.name,
        soldQuantity: item._sum.quantity || 0
      }))
    };
  }

  public async getPaidOrderItems(): Promise<{ productId: string, quantity: number, price: number }[]> {
    const items = await prisma.orderItem.findMany({
      where: { order: { status: 'PAID' } },
      select: { productId: true, quantity: true, price: true }
    });
    return items;
  }

  private mapToEntity(record: any): Order {
    const items = record.items.map((item: any) => new OrderItem(
      item.productId,
      item.name,
      item.price,
      item.quantity
    ));
    
    return new Order(
      record.id,
      record.userId,
      items,
      record.totalAmount,
      record.status as OrderStatus,
      record.createdAt,
      record.appliedCouponCode
    );
  }
}
