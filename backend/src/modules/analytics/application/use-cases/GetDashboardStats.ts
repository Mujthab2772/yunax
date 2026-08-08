import { IOrderRepository } from '../../../orders/domain/repositories/IOrderRepository';
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';

export class GetDashboardStats {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(period: string = 'all') {
    let startDate: Date | undefined;
    if (period === '7d' || period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d' || period === 'month') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    const orderStats = await this.orderRepository.getAnalytics(startDate);
    const totalCustomers = await this.userRepository.countCustomers();
    const allPaidOrderItems = await this.orderRepository.getPaidOrderItems(startDate);
    const recentOrders = await this.orderRepository.getRecentDeliveredOrders(startDate, 10);

    // Map sales by category
    const salesByCategoryMap = new Map<string, number>();
    for (const item of allPaidOrderItems) {
      const product = await this.productRepository.getById(item.productId);
      if (product) {
        const currentRevenue = salesByCategoryMap.get(product.category) || 0;
        salesByCategoryMap.set(product.category, currentRevenue + item.priceCents * item.quantity);
      }
    }

    const salesByCategory = Array.from(salesByCategoryMap.entries()).map(([category, revenue]) => ({
      category,
      revenue
    }));

    return {
      overview: {
        totalRevenue: orderStats.totalRevenue,
        totalOrders: orderStats.totalOrders,
        totalCustomers: totalCustomers
      },
      topSellingProducts: orderStats.topProducts,
      salesByCategory,
      recentOrders
    };
  }
}
