import { IOrderRepository } from '../../../orders/domain/repositories/IOrderRepository';
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';

export class GetDashboardStats {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly productRepository: IProductRepository
  ) {}

  public async execute() {
    const orderStats = await this.orderRepository.getAnalytics();
    const totalCustomers = await this.userRepository.countCustomers();
    const allPaidOrderItems = await this.orderRepository.getPaidOrderItems();

    // Map sales by category
    const salesByCategoryMap = new Map<string, number>();
    for (const item of allPaidOrderItems) {
      const product = await this.productRepository.getById(item.productId);
      if (product) {
        const currentRevenue = salesByCategoryMap.get(product.category_id) || 0;
        salesByCategoryMap.set(product.category_id, currentRevenue + item.price * item.quantity);
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
      salesByCategory
    };
  }
}
