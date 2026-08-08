import { Request, Response, NextFunction } from 'express';
import { ListAdminReviews } from '../../application/use-cases/ListAdminReviews';
import { UpdateReviewStatus } from '../../application/use-cases/UpdateReviewStatus';
import { DeleteReview } from '../../application/use-cases/DeleteReview';

export class AdminReviewController {
  constructor(
    private readonly listAdminReviews: ListAdminReviews,
    private readonly updateReviewStatus: UpdateReviewStatus,
    private readonly deleteReview: DeleteReview
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await this.listAdminReviews.execute();
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const review = await this.updateReviewStatus.execute(req.params.id as string, status);
      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteReview.execute(req.params.id as string);
      res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
      next(error);
    }
  };
}
