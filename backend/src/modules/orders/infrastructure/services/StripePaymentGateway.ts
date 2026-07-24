import Stripe from 'stripe';
import { IPaymentGateway } from '../../application/ports/IPaymentGateway';

export class StripePaymentGateway implements IPaymentGateway {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' as any });
  }

  public async createPaymentIntent(amount: number, currency: string, orderId: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency,
      metadata: { orderId }
    });
    return { clientSecret: paymentIntent.client_secret!, paymentId: paymentIntent.id };
  }

  public constructEvent(payload: Buffer, signature: string): any {
    return this.stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  }
}
