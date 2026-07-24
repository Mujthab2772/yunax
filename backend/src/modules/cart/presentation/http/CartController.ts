import { Request, Response, NextFunction } from 'express';
import { GetCartByUserId } from '../../application/use-cases/GetCartByUserId';
import { AddItemToCart } from '../../application/use-cases/AddItemToCart';

export class CartController {
  constructor(
    private readonly getCartByUserId: GetCartByUserId,
    private readonly addItemToCart: AddItemToCart
  ) {}

  public getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const cart = await this.getCartByUserId.execute(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  };

  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { productId, quantity } = req.body;
      const cart = await this.addItemToCart.execute(userId, productId, quantity);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  };
}
