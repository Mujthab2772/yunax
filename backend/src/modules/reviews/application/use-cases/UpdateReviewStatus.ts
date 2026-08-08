import { IReviewRepository } from '../../domain/repositories/IReviewRepository';
import { ApiError } from '../../../../utils/ApiError';

export class UpdateReviewStatus {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  public async execute(id: string, status: string): Promise<any> {
    const review = await this.reviewRepository.getById(id);
    if (!review) throw new ApiError(404, 'Review not found');

    review.status = status;
    return this.reviewRepository.save(review);
  }
}
