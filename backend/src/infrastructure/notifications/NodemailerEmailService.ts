import nodemailer from 'nodemailer';
import { IEmailService } from './IEmailService';
import { Order } from '../../modules/orders/domain/entities/Order';

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  public async sendOrderConfirmation(userEmail: string, order: Order): Promise<void> {
    const html = this.buildOrderHtml(order);

    await this.transporter.sendMail({
      from: '"Yunax E-Commerce" <no-reply@yunax.com>',
      to: userEmail,
      subject: `Order Confirmation - #${order.id.split('-')[0]}`,
      html,
    });
  }

  private buildOrderHtml(order: Order): string {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${(item.priceCents / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Thank you for your order!</h2>
        <p>Your payment has been successfully processed.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa; text-align: left;">
              <th style="padding: 8px;">Product</th>
              <th style="padding: 8px;">Quantity</th>
              <th style="padding: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <h3 style="text-align: right; margin-top: 20px;">Total: $${(order.totalCents / 100).toFixed(2)}</h3>
      </div>
    `;
  }
}
