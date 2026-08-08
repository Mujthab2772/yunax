import { Request, Response, NextFunction } from 'express';
import { PlaceOrder } from '../../application/use-cases/PlaceOrder';
import { GetOrderHistory } from '../../application/use-cases/GetOrderHistory';
import { GetAllOrders } from '../../application/use-cases/GetAllOrders';
import { UpdateOrderStatus } from '../../application/use-cases/UpdateOrderStatus';
import { CancelOrder } from '../../application/use-cases/CancelOrder';
import { DeleteOrder } from '../../application/use-cases/DeleteOrder';
import { GetOrderInvoice } from '../../application/use-cases/GetOrderInvoice';
import { IPaymentGateway } from '../../application/ports/IPaymentGateway';
import crypto from 'crypto';

const idempotencyCache = new Map<string, any>();

export class OrderController {
  constructor(
    private readonly placeOrderUseCase: PlaceOrder,
    private readonly getOrderHistoryUseCase: GetOrderHistory,
    private readonly getAllOrdersUseCase: GetAllOrders,
    private readonly updateOrderStatusUseCase: UpdateOrderStatus,
    private readonly cancelOrderUseCase: CancelOrder,
    private readonly deleteOrderUseCase: DeleteOrder,
    private readonly getOrderInvoiceUseCase: GetOrderInvoice,
    private readonly paymentGateway: IPaymentGateway
  ) {}

  public checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { items, shippingAddress, paymentMethod, couponCode } = req.body;
      const idempotencyKey = req.headers['idempotency-key'] as string;
      
      if (idempotencyKey) {
        if (idempotencyCache.has(idempotencyKey)) {
          return res.status(201).json(idempotencyCache.get(idempotencyKey));
        }
      }

      const result = await this.placeOrderUseCase.execute(userId, items, shippingAddress, paymentMethod, couponCode);
      
      const responseData = { 
        success: true, 
        data: result.order, 
        clientSecret: result.clientSecret,
        keyId: process.env.RAZORPAY_KEY_ID
      };

      if (idempotencyKey) {
        idempotencyCache.set(idempotencyKey, responseData);
        // Clear cache after 5 minutes to prevent memory leaks
        setTimeout(() => idempotencyCache.delete(idempotencyKey), 5 * 60 * 1000);
      }

      res.status(201).json(responseData);
    } catch (error) {
      next(error);
    }
  };

  public quote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body;
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.priceCents || 0) * (item.quantity || 1), 0);
      res.status(200).json({
        discountCents: 0,
        shippingCents: 0,
        taxCents: 0,
        totalCents: subtotal,
        shipping: { serviceable: true }
      });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user!;
      if (user.role === 'admin') {
        const orders = await this.getAllOrdersUseCase.execute();
        res.status(200).json(orders);
      } else {
        const orders = await this.getOrderHistoryUseCase.execute(user.id);
        res.status(200).json(orders);
      }
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, note } = req.body;
      const order = await this.updateOrderStatusUseCase.execute(req.params.id as string, status, note);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  };

  public cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user!;
      const order = await this.cancelOrderUseCase.execute(req.params.id as string, user.id, user.role === 'admin');
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  };

  public deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteOrderUseCase.execute(req.params.id as string);
      res.status(200).json({ message: 'Order deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user!;
      const invoice = await this.getOrderInvoiceUseCase.execute(req.params.id as string, user.id, user.role === 'admin');
      res.status(200).json(invoice);
    } catch (error) {
      next(error);
    }
  };

  public verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
      const secret = process.env.RAZORPAY_KEY_SECRET as string;
      const expectedSignature = crypto.createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        if (order_id) {
          await this.updateOrderStatusUseCase.execute(order_id, 'PAID', `Paid via Razorpay (Payment ID: ${razorpay_payment_id})`);
        }
        res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    } catch (error) {
      next(error);
    }
  };
}
