import { Request, Response, NextFunction } from 'express';
import { PlaceOrder } from '../../application/use-cases/PlaceOrder';
import { GetOrderHistory } from '../../application/use-cases/GetOrderHistory';

export class OrderController {
  constructor(
    private readonly placeOrder: PlaceOrder,
    private readonly getOrderHistory: GetOrderHistory
  ) {}

  public checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { couponCode } = req.body;
      const result = await this.placeOrder.execute(userId, couponCode);
      res.status(201).json({ success: true, data: result.order, clientSecret: result.clientSecret });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const orders = await this.getOrderHistory.execute(userId);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  };
}
