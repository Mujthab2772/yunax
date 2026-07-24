import { Order } from '../entities/Order';

export interface IOrderAnalytics {
  totalRevenue: number;
  totalOrders: number;
  topProducts: { productId: string; name: string; soldQuantity: number }[];
}

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  getByUserId(userId: string): Promise<Order[]>;
  hasVerifiedPurchase(userId: string, productId: string): Promise<boolean>;
  getAnalytics(): Promise<IOrderAnalytics>;
  getPaidOrderItems(): Promise<{ productId: string, quantity: number, price: number }[]>;
}
