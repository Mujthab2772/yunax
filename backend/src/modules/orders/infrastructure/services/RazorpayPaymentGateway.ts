import Razorpay from 'razorpay';
import crypto from 'crypto';
import { IPaymentGateway } from '../../application/ports/IPaymentGateway';

export class RazorpayPaymentGateway implements IPaymentGateway {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }

  public async createPaymentIntent(amount: number, currency: string, orderId: string) {
    // Razorpay amount is in the smallest currency unit (e.g. paise for INR)
    // Since 'amount' passed from PlaceOrder.ts is already in cents/paise (totalCents)
    // we don't multiply by 100 here.
    const options = {
      amount: Math.round(amount),
      currency: 'INR', // Razorpay typically uses INR, ignoring the passed currency
      receipt: orderId,
    };
    
    const order = await this.razorpay.orders.create(options);
    
    // For Razorpay, the "clientSecret" or order ID is needed by the frontend to initiate payment
    return { clientSecret: order.id, paymentId: order.id };
  }

  public constructEvent(payload: Buffer, signature: string): any {
    // Razorpay verifies webhook signatures using crypto HMAC
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload.toString()).digest('hex');
    
    if (expectedSignature !== signature) {
      throw new Error('Invalid Razorpay signature');
    }
    
    // Parse the payload and return the event object
    return JSON.parse(payload.toString());
  }
}
