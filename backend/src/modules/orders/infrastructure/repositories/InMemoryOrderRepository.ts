import { IOrderRepository, IOrderAnalytics } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Order[] = [];

  public async save(order: Order): Promise<Order> {
    const existingIndex = this.orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
      this.orders[existingIndex] = order;
    } else {
      this.orders.push(order);
    }
    return order;
  }

  public async saveWithStockReservation(order: Order, items: {productId: string, quantity: number, name: string}[]): Promise<Order> {
    return this.save(order); // Mock
  }

  public async getRecentDeliveredOrders(startDate?: Date, limit?: number): Promise<any[]> {
    return []; // Mock
  }

  public async getById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }

  public async getByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter(o => o.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async listAll(): Promise<any[]> {
    return Array.from(this.orders);
  }

  public async delete(id: string): Promise<void> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders.splice(index, 1);
    }
  }

  public async hasVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    const order = this.orders.find(o => 
      o.userId === userId && 
      o.status === 'PAID' && 
      o.items.some(i => i.productId === productId)
    );
    return !!order;
  }

  public async getAnalytics(): Promise<IOrderAnalytics> {
    const paidOrders = this.orders.filter(o => o.status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);

    const productSales = new Map<string, { name: string; quantity: number }>();
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { name: item.name, quantity: 0 };
        existing.quantity += item.quantity;
        productSales.set(item.productId, existing);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        soldQuantity: data.quantity
      }));

    return {
      totalRevenue,
      totalOrders: paidOrders.length,
      topProducts
    };
  }

  public async getPaidOrderItems(): Promise<{ productId: string, quantity: number, priceCents: number }[]> {
    const items: { productId: string, quantity: number, priceCents: number }[] = [];
    this.orders.filter(o => o.status === 'PAID').forEach(order => {
      order.items.forEach(item => {
        items.push({ productId: item.productId, quantity: item.quantity, priceCents: item.priceCents });
      });
    });
    return items;
  }
}
