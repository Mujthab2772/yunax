import { OrderItem } from './OrderItem';
import { OrderStatus } from './OrderStatus';

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public status: OrderStatus = OrderStatus.PENDING,
    public readonly createdAt: Date = new Date(),
    public readonly appliedCouponCode?: string
  ) {}

  public markAsPaid(): void {
    this.status = OrderStatus.PAID;
  }

  public markAsShipped(): void {
    this.status = OrderStatus.SHIPPED;
  }
  
  public cancel(): void {
    this.status = OrderStatus.CANCELLED;
  }
}
