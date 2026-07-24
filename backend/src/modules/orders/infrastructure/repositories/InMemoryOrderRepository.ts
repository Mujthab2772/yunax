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

  public async getById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }

  public async getByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter(order => order.userId === userId);
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
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

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

  public async getPaidOrderItems(): Promise<{ productId: string, quantity: number, price: number }[]> {
    const items: { productId: string, quantity: number, price: number }[] = [];
    this.orders.filter(o => o.status === 'PAID').forEach(order => {
      order.items.forEach(item => {
        items.push({ productId: item.productId, quantity: item.quantity, price: item.price });
      });
    });
    return items;
  }
}
