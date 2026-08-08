import { Request, Response, NextFunction } from 'express';
import { GetCartByUserId } from '../../application/use-cases/GetCartByUserId';
import { AddItemToCart } from '../../application/use-cases/AddItemToCart';
import { UpdateCartItemQuantity } from '../../application/use-cases/UpdateCartItemQuantity';
import { RemoveItemFromCart } from '../../application/use-cases/RemoveItemFromCart';
import { ClearCart } from '../../application/use-cases/ClearCart';

export class CartController {
  constructor(
    private readonly getCartByUserId: GetCartByUserId,
    private readonly addItemToCart: AddItemToCart,
    private readonly updateCartItemQuantity: UpdateCartItemQuantity,
    private readonly removeItemFromCart: RemoveItemFromCart,
    private readonly clearCartUseCase: ClearCart
  ) { }

  public getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const cart = await this.getCartByUserId.execute(userId);
      res.status(200).json({ success: true, data: cart || { userId, items: [] } });
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

  public updateQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { productId } = req.params as { productId: string };
      const { quantity } = req.body;
      const cart = await this.updateCartItemQuantity.execute(userId, productId, quantity);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  };

  public removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { productId } = req.params as { productId: string };
      const cart = await this.removeItemFromCart.execute(userId, productId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  };

  public clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const cart = await this.clearCartUseCase.execute(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  };
}
