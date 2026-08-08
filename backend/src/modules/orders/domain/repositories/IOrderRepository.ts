import { Order } from '../entities/Order';

export interface IOrderAnalytics {
  totalRevenue: number;
  totalOrders: number;
  topProducts: { productId: string; name: string; soldQuantity: number }[];
}

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  saveWithStockReservation(order: Order, items: {productId: string, quantity: number, name: string}[]): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  getByUserId(userId: string): Promise<Order[]>;
  listAll(): Promise<any[]>;
  delete(id: string): Promise<void>;
  hasVerifiedPurchase(userId: string, productId: string): Promise<boolean>;
  getAnalytics(startDate?: Date): Promise<IOrderAnalytics>;
  getPaidOrderItems(startDate?: Date): Promise<{ productId: string, quantity: number, priceCents: number }[]>;
  getRecentDeliveredOrders(startDate?: Date, limit?: number): Promise<any[]>;
}
