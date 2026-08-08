import { OrderItem } from './OrderItem';
import { OrderStatus } from './OrderStatus';

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalCents: number,
    public readonly subtotalCents: number,
    public status: OrderStatus = OrderStatus.PENDING,
    public paymentMethod?: string | null,
    public shippingAddress?: any | null,
    public statusHistory?: any | null,
    public adminNote?: string | null,
    public readonly createdAt: Date = new Date(),
    public readonly appliedCouponCode?: string | null
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
