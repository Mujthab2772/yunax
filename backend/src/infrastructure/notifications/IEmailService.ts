import { Order } from '../../modules/orders/domain/entities/Order';

export interface IEmailService {
  sendOrderConfirmation(userEmail: string, order: Order): Promise<void>;
}
