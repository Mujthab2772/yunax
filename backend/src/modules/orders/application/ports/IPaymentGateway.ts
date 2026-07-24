export interface IPaymentGateway {
  createPaymentIntent(amount: number, currency: string, orderId: string): Promise<{ clientSecret: string, paymentId: string }>;
  constructEvent(payload: Buffer, signature: string): any;
}
