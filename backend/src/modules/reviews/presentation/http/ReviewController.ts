import { Request, Response, NextFunction } from 'express';
import { AddReview } from '../../application/use-cases/AddReview';
import { GetProductReviews } from '../../application/use-cases/GetProductReviews';

export class ReviewController {
  constructor(
    private readonly addReviewUseCase: AddReview,
    private readonly getProductReviewsUseCase: GetProductReviews
  ) {}

  public addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const productId = req.params.id as string;
      const { rating, comment } = req.body;

      const review = await this.addReviewUseCase.execute(userId, productId, rating, comment);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  };

  public getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id as string;
      const data = await this.getProductReviewsUseCase.execute(productId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
