import { Request, Response, NextFunction } from 'express';
import { ToggleWishlist } from '../../application/use-cases/ToggleWishlist';
import { GetWishlist } from '../../application/use-cases/GetWishlist';

export class WishlistController {
  constructor(
    private readonly toggleWishlistUseCase: ToggleWishlist,
    private readonly getWishlistUseCase: GetWishlist
  ) {}

  public toggleWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const productId = req.params.productId as string;

      const result = await this.toggleWishlistUseCase.execute(userId, productId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  public getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = await this.getWishlistUseCase.execute(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
