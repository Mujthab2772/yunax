import { IReviewRepository } from '../../domain/repositories/IReviewRepository';

export class ListAdminReviews {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  public async execute(): Promise<any[]> {
    return this.reviewRepository.listAllAdmin();
  }
}
