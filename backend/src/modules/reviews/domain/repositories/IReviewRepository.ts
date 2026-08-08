import { Review } from '../entities/Review';

export interface IReviewRepository {
  save(review: Review): Promise<Review>;
  getByProductId(productId: string): Promise<Review[]>;
  getByUserIdAndProductId(userId: string, productId: string): Promise<Review | null>;
  listAllAdmin(): Promise<any[]>;
  getById(id: string): Promise<Review | null>;
  delete(id: string): Promise<void>;
}
