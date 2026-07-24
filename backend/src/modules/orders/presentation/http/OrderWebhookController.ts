import { Request, Response } from 'express';
import { HandlePaymentSuccess } from '../../application/use-cases/HandlePaymentSuccess';
import { IPaymentGateway } from '../../application/ports/IPaymentGateway';

export class OrderWebhookController {
  constructor(
    private readonly handlePaymentSuccess: HandlePaymentSuccess,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  public handleEvent = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    let event;

    try {
      event = this.paymentGateway.constructEvent(req.body, sig);
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      
      if (orderId) {
        await this.handlePaymentSuccess.execute(orderId);
      }
    }

    res.json({ received: true });
  };
}
