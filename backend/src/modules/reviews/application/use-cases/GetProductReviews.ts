import { IReviewRepository } from '../../domain/repositories/IReviewRepository';

export class GetProductReviews {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  public async execute(productId: string) {
    const reviews = await this.reviewRepository.getByProductId(productId);
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    
    return {
      averageRating: Number(averageRating),
      totalReviews: reviews.length,
      reviews
    };
  }
}
