import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { IOrderRepository } from '../../../orders/domain/repositories/IOrderRepository';
import { Review } from '../../domain/entities/Review';
import { ApiError } from '../../../../utils/ApiError';
import crypto from 'crypto';

export class AddReview {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  public async execute(userId: string, productId: string, rating: number, comment: string): Promise<Review> {
    const hasPurchased = await this.orderRepository.hasVerifiedPurchase(userId, productId);
    if (!hasPurchased) {
      throw new ApiError(403, 'Only verified buyers can leave a review');
    }

    const existingReview = await this.reviewRepository.getByUserIdAndProductId(userId, productId);
    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this product');
    }

    const reviewId = crypto.randomUUID();
    const review = new Review(reviewId, userId, productId, rating, comment);
    
    return this.reviewRepository.save(review);
  }
}
