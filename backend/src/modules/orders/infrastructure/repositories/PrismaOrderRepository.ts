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
        totalCents: order.totalCents,
        subtotalCents: order.subtotalCents,
        paymentMethod: order.paymentMethod ?? null,
        shippingAddress: order.shippingAddress ?? null,
        statusHistory: order.statusHistory ?? null,
        adminNote: order.adminNote ?? null,
        appliedCouponCode: order.appliedCouponCode ?? null,
      },
      create: {
        id: order.id,
        userId: order.userId,
        totalCents: order.totalCents,
        subtotalCents: order.subtotalCents,
        paymentMethod: order.paymentMethod ?? null,
        shippingAddress: order.shippingAddress ?? null,
        statusHistory: order.statusHistory ?? null,
        adminNote: order.adminNote ?? null,
        status: order.status,
        createdAt: order.createdAt,
        appliedCouponCode: order.appliedCouponCode ?? null,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            name: item.name,
            priceCents: item.priceCents,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });

    return this.mapToEntity(record);
  }
  public async saveWithStockReservation(order: Order, items: {productId: string, quantity: number, name: string}[]): Promise<Order> {
    const record = await prisma.$transaction(async (tx) => {
      // 1. Atomically reserve stock
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: { 
            id: item.productId,
            stock: { gte: item.quantity } 
          },
          data: {
            stock: { decrement: item.quantity }
          }
        });
        
        if (result.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK: ${item.name}`);
        }
      }

      // 2. Create the order
      return await tx.order.create({
        data: {
          id: order.id,
          userId: order.userId,
          totalCents: order.totalCents,
          subtotalCents: order.subtotalCents,
          paymentMethod: order.paymentMethod ?? null,
          shippingAddress: order.shippingAddress ?? null,
          statusHistory: order.statusHistory ?? null,
          adminNote: order.adminNote ?? null,
          status: order.status,
          createdAt: order.createdAt,
          appliedCouponCode: order.appliedCouponCode ?? null,
          items: {
            create: order.items.map(item => ({
              productId: item.productId,
              name: item.name,
              priceCents: item.priceCents,
              quantity: item.quantity
            }))
          }
        },
        include: { items: true }
      });
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

  public async listAll(): Promise<any[]> {
    const records = await prisma.order.findMany({
      include: { 
        items: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return records.map(record => {
      const order = this.mapToEntity(record) as any;
      order.customerName = (record as any).user?.name || null;
      order.customerEmail = (record as any).user?.email || null;
      return order;
    });
  }

  public async delete(id: string): Promise<void> {
    await prisma.order.delete({ where: { id } }).catch(() => {});
  }

  public async hasVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['PAID', 'SHIPPED'] },
        items: {
          some: {
            productId
          }
        }
      }
    });
    return !!order;
  }

  public async getAnalytics(startDate?: Date): Promise<IOrderAnalytics> {
    const whereClause: any = { status: 'delivered' };
    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }

    const orderStats = await prisma.order.aggregate({
      where: whereClause,
      _sum: { totalCents: true },
      _count: { id: true }
    });

    const topItems = await prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: { order: whereClause },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    return {
      totalRevenue: orderStats._sum.totalCents || 0,
      totalOrders: orderStats._count.id,
      topProducts: topItems.map(item => ({
        productId: item.productId,
        name: item.name,
        soldQuantity: item._sum.quantity || 0
      }))
    };
  }

  public async getPaidOrderItems(startDate?: Date): Promise<{ productId: string, quantity: number, priceCents: number }[]> {
    const whereClause: any = { status: 'delivered' };
    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }
    const items = await prisma.orderItem.findMany({
      where: { order: whereClause },
      select: { productId: true, quantity: true, priceCents: true }
    });
    return items;
  }

  public async getRecentDeliveredOrders(startDate?: Date, limit: number = 10): Promise<any[]> {
    const whereClause: any = { status: 'delivered' };
    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }
    const records = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { name: true, email: true } } }
    });
    
    return records.map(record => {
      return {
        id: record.id,
        totalCents: record.totalCents,
        createdAt: record.createdAt,
        customerName: record.user?.name || 'Customer'
      };
    });
  }

  private mapToEntity(record: any): Order {
    const items = record.items.map((item: any) => new OrderItem(
      item.productId,
      item.name,
      item.priceCents,
      item.quantity
    ));
    
    return new Order(
      record.id,
      record.userId,
      items,
      record.totalCents,
      record.subtotalCents,
      record.status as OrderStatus,
      record.paymentMethod,
      record.shippingAddress,
      record.statusHistory,
      record.adminNote,
      record.createdAt,
      record.appliedCouponCode
    );
  }
}
