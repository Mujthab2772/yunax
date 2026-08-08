import { IReviewRepository } from '../../domain/repositories/IReviewRepository';

export class DeleteReview {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  public async execute(id: string): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
