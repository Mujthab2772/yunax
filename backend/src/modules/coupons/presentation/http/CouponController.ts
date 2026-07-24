import { Request, Response, NextFunction } from 'express';
import { ValidateCoupon } from '../../application/use-cases/ValidateCoupon';

export class CouponController {
  constructor(private readonly validateCouponUseCase: ValidateCoupon) {}

  public validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, cartTotal } = req.body;
      const result = await this.validateCouponUseCase.execute(code, Number(cartTotal));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
