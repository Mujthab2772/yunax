export class Review {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: string,
    public readonly rating: number,
    public readonly comment: string,
    public readonly createdAt: Date = new Date()
  ) {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  }
}
