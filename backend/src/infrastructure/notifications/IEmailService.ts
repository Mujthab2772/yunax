import { Order } from '../../modules/orders/domain/entities/Order';

export interface IEmailService {
  sendOrderConfirmation(userEmail: string, order: Order): Promise<void>;
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}
